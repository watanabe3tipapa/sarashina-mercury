const configuredBase = import.meta.env.VITE_SARASHINA_API_BASE?.trim()

// Prefer the configured base (a proxy such as the bundled Cloudflare Worker,
// which is required in production because the API sends no CORS headers).
// Fall back to the Vite dev proxy in development, or the API origin otherwise.
const SARASHINA_API_BASE =
  configuredBase ||
  (import.meta.env.DEV
    ? "/proxy/sarashina/v1"
    : "https://api.sarashina.ai/v1")

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  stream?: boolean
  temperature?: number
  max_completion_tokens?: number
}

export type EmbeddingTaskType =
  | "RETRIEVAL_DOCUMENT"
  | "SEMANTIC_SIMILARITY"
  | "RETRIEVAL_QUERY"
  | "QUESTION_ANSWERING"
  | "FACT_VERIFICATION"
  | "CLASSIFICATION"
  | "CLUSTERING"

export type RerankTaskType =
  | "GENERAL_RETRIEVAL"
  | "GENERAL_QA"
  | "NEWS_RETRIEVAL"
  | "SEMANTIC_SIMILARITY"
  | "CUSTOMIZE"

export interface EmbeddingResponse {
  data: { object: string; index: number; embedding: number[] }[]
  usage: { prompt_tokens: number; total_tokens: number }
}

export interface RerankResponse {
  data: { object: string; index: number; result: { document_id: number; score: number }[] }[]
  usage: { prompt_tokens: number; total_tokens: number; completion_tokens: number }
}

export interface GuardResult {
  safe: boolean
  categories: string[]
  raw: string
}

// 403: the Worker may have executed outside Japan (API is geo-restricted).
// 429: rate limit. Retrying re-rolls the Cloudflare edge placement.
const RETRY_STATUSES = new Set([403, 429])
const MAX_RETRIES = 3

async function postJSON(
  path: string,
  apiKey: string,
  body: unknown
): Promise<Response> {
  let last: Response | undefined
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(`${SARASHINA_API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })
    if (res.ok) return res
    last = res
    if (!RETRY_STATUSES.has(res.status) || attempt === MAX_RETRIES) break
    await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)))
  }
  throw new Error(await last!.text())
}

export async function* streamChat(
  apiKey: string,
  request: ChatCompletionRequest
): AsyncGenerator<{ content: string }> {
  const res = await postJSON("/chat/completions", apiKey, {
    ...request,
    stream: true,
  })

  const reader = res.body?.getReader()
  if (!reader) throw new Error("No stream")

  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split("\n")
    buffer = lines.pop() || ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed === "") continue
      if (trimmed === "data: [DONE]") return
      if (trimmed.startsWith("data: ")) {
        try {
          const data = JSON.parse(trimmed.slice(6))
          const content = data.choices?.[0]?.delta?.content
          if (content) {
            yield { content }
          }
        } catch {
          // ignore parse errors
        }
      }
    }
  }
}

export async function translate(
  apiKey: string,
  params: {
    text: string
    direction: "ja-en" | "en-ja"
    tone?: string
  }
): Promise<{ translated_text: string }> {
  const [source_lang, target_lang] =
    params.direction === "ja-en" ? ["ja", "en"] : ["en", "ja"]

  const res = await postJSON("/translate", apiKey, {
    text: params.text,
    source_lang,
    target_lang,
    tone: params.tone || "business-casual",
  })
  return res.json()
}

export async function embedText(
  apiKey: string,
  text: string,
  taskType: EmbeddingTaskType = "RETRIEVAL_QUERY"
): Promise<EmbeddingResponse> {
  const res = await postJSON("/embeddings", apiKey, {
    model: "sarashina3-embedding",
    input: text,
    task_type: taskType,
  })
  return res.json()
}

export async function rerank(
  apiKey: string,
  params: { query: string; documents: string[]; taskType?: RerankTaskType }
): Promise<RerankResponse> {
  const res = await postJSON("/rerank", apiKey, {
    model: "sarashina3-rerank",
    query: params.query,
    documents: params.documents,
    task_type: params.taskType ?? "GENERAL_RETRIEVAL",
  })
  return res.json()
}

export async function guard(apiKey: string, text: string): Promise<GuardResult> {
  const res = await postJSON("/chat/completions", apiKey, {
    model: "sarashina3-guard",
    messages: [{ role: "user", content: text }],
  })
  const data = await res.json()
  const raw: string = data.choices?.[0]?.message?.content ?? ""
  const [verdict, categoryList] = raw.split("\n")
  return {
    safe: verdict?.trim() === "安全",
    categories: categoryList
      ? categoryList.split(",").map((c) => c.trim()).filter(Boolean)
      : [],
    raw,
  }
}

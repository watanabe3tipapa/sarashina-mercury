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

// fetch aborts with a DOMException named "AbortError"; normalise detection so
// callers can distinguish a user-initiated stop from a real failure.
export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException || error instanceof Error) &&
    error.name === "AbortError"
  )
}

// 403: the Worker may have executed outside Japan (API is geo-restricted).
// 429: rate limit. Retrying re-rolls the Cloudflare edge placement.
const RETRY_STATUSES = new Set([403, 429])
const MAX_RETRIES = 3

async function readError(res: Response): Promise<string> {
  const text = await res.text()
  try {
    const data = JSON.parse(text)
    const message = data?.error?.message ?? data?.message
    if (typeof message === "string" && message) return message
  } catch {
    // Not JSON; fall back to the raw body.
  }
  return text
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason)
      return
    }
    const onAbort = () => {
      clearTimeout(timer)
      reject(signal?.reason)
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, ms)
    signal?.addEventListener("abort", onAbort, { once: true })
  })
}

async function postJSON(
  path: string,
  apiKey: string,
  body: unknown,
  signal?: AbortSignal
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
      signal,
    })
    if (res.ok) return res
    last = res
    if (!RETRY_STATUSES.has(res.status) || attempt === MAX_RETRIES) break
    await sleep(400 * (attempt + 1), signal)
  }
  throw new Error(await readError(last!))
}

export async function* streamChat(
  apiKey: string,
  request: ChatCompletionRequest,
  signal?: AbortSignal
): AsyncGenerator<{ content: string }> {
  const res = await postJSON(
    "/chat/completions",
    apiKey,
    {
      ...request,
      stream: true,
    },
    signal
  )

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
        } catch (e) {
          if (import.meta.env.DEV) {
            console.warn("Failed to parse SSE chunk:", trimmed, e)
          }
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
  },
  signal?: AbortSignal
): Promise<{ translated_text: string }> {
  const [source_lang, target_lang] =
    params.direction === "ja-en" ? ["ja", "en"] : ["en", "ja"]

  const res = await postJSON(
    "/translate",
    apiKey,
    {
      text: params.text,
      source_lang,
      target_lang,
      tone: params.tone || "business-casual",
    },
    signal
  )
  return res.json()
}

export async function embedText(
  apiKey: string,
  text: string,
  taskType: EmbeddingTaskType = "RETRIEVAL_QUERY",
  signal?: AbortSignal
): Promise<EmbeddingResponse> {
  const res = await postJSON(
    "/embeddings",
    apiKey,
    {
      model: "sarashina3-embedding",
      input: text,
      task_type: taskType,
    },
    signal
  )
  return res.json()
}

export async function rerank(
  apiKey: string,
  params: { query: string; documents: string[]; taskType?: RerankTaskType },
  signal?: AbortSignal
): Promise<RerankResponse> {
  const res = await postJSON(
    "/rerank",
    apiKey,
    {
      model: "sarashina3-rerank",
      query: params.query,
      documents: params.documents,
      task_type: params.taskType ?? "GENERAL_RETRIEVAL",
    },
    signal
  )
  return res.json()
}

export async function guard(
  apiKey: string,
  text: string,
  signal?: AbortSignal
): Promise<GuardResult> {
  const res = await postJSON(
    "/chat/completions",
    apiKey,
    {
      model: "sarashina3-guard",
      messages: [{ role: "user", content: text }],
    },
    signal
  )
  const data = await res.json()
  const raw: string = data.choices?.[0]?.message?.content ?? ""
  // The model returns a verdict line ("安全" or "有害") optionally followed by
  // one or more T1–T12 category codes (e.g. "有害\nT8").
  const [verdict, ...rest] = raw.split("\n")
  const categories = [
    ...new Set(
      Array.from(
        rest.join(" ").matchAll(/\bT(?:1[0-2]|[1-9])\b/gi),
        (m) => m[0].toUpperCase()
      )
    ),
  ]
  return {
    safe: verdict?.trim() === "安全",
    categories,
    raw,
  }
}

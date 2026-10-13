const SARASHINA_API_BASE = "https://api.sarashina.ai/v1"

export interface ChatMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

export async function* streamChat(
  apiKey: string,
  request: ChatCompletionRequest
): AsyncGenerator<{ content: string }> {
  const res = await fetch(`${SARASHINA_API_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...request, stream: true }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(error)
  }

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
) {
  const res = await fetch(`${SARASHINA_API_BASE}/translations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "sarashina3-translate",
      text: params.text,
      direction: params.direction,
      tone: params.tone || "business-casual",
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function embedText(apiKey: string, text: string) {
  const res = await fetch(`${SARASHINA_API_BASE}/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "sarashina3-embedding",
      input: text,
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function rerank(
  apiKey: string,
  params: { query: string; documents: string[] }
) {
  const res = await fetch(`${SARASHINA_API_BASE}/rerank`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "sarashina3-rerank",
      query: params.query,
      documents: params.documents,
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function guard(apiKey: string, text: string) {
  const res = await fetch(`${SARASHINA_API_BASE}/guard`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      text,
      model: "sarashina3-guard",
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

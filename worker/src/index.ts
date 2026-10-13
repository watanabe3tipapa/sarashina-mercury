const UPSTREAM = "https://api.sarashina.ai"

export interface Env {
  ALLOWED_ORIGIN?: string
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  }
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(env.ALLOWED_ORIGIN ?? "*")

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors })
    }

    if (request.method !== "POST") {
      return json({ message: "Method Not Allowed" }, 405, cors)
    }

    const { pathname, search } = new URL(request.url)
    const authorization = request.headers.get("Authorization")

    const upstream = await fetch(`${UPSTREAM}${pathname}${search}`, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("Content-Type") ?? "application/json",
        Accept: "application/json",
        "User-Agent": "sarashina-mercury",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: request.body,
    })

    const headers = new Headers(upstream.headers)
    headers.delete("content-encoding")
    headers.delete("content-length")
    headers.delete("content-security-policy")
    for (const [key, value] of Object.entries(cors)) headers.set(key, value)

    return new Response(upstream.body, { status: upstream.status, headers })
  },
}

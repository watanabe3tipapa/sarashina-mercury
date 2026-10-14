const UPSTREAM = "https://api.sarashina.ai"

export interface Env {
  ALLOWED_ORIGIN?: string
}

function corsHeaders(
  origin: string | null,
  allowedOrigin: string
): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }
  // Only grant access when the request origin is allowed; otherwise omit the
  // header so the browser blocks the response.
  if (allowedOrigin === "*") {
    headers["Access-Control-Allow-Origin"] = "*"
  } else if (origin === allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = origin
  }
  return headers
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(
      request.headers.get("Origin"),
      env.ALLOWED_ORIGIN ?? "*"
    )

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors })
    }

    if (request.method !== "POST") {
      return json({ message: "Method Not Allowed" }, 405, cors)
    }

    const { pathname, search } = new URL(request.url)

    if (!pathname.startsWith("/v1/")) {
      return json({ message: "Not Found" }, 404, cors)
    }

    const authorization = request.headers.get("Authorization")
    const accept = request.headers.get("Accept")

    const upstream = await fetch(`${UPSTREAM}${pathname}${search}`, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("Content-Type") ?? "application/json",
        ...(accept ? { Accept: accept } : {}),
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

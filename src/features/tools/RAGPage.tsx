import { useState } from "react"
import { Link } from "react-router-dom"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useSettingsStore } from "@/store/useSettingsStore"
import { rerank, streamChat, type ChatMessage } from "@/lib/api/sarashina"
import SourceCitation from "@/components/SourceCitation"

interface RankedDoc {
  document_id: number
  score: number
  document: string
}

const MAX_DOCS = 20
const TOP_K = 5

const RAG_SYSTEM_PROMPT = `あなたは与えられた資料のみに基づいて質問へ回答するアシスタントです。
- 回答の根拠となる資料番号を [1] や [2] のように必ず付記してください。
- 資料に書かれていない内容は推測せず「資料からは分かりません」と答えてください。`

export default function RAGPage() {
  const { apiKey, model } = useSettingsStore()
  const [query, setQuery] = useState("")
  const [docs, setDocs] = useState("")
  const [answer, setAnswer] = useState("")
  const [sources, setSources] = useState<RankedDoc[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const scrollToSource = (n: string) => {
    document
      .getElementById(`source-${n}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" })
    setActive(n)
  }

  const handleRun = async () => {
    if (!query.trim() || !docs.trim() || !apiKey || loading) return
    const documents = docs
      .split("\n\n")
      .map((d) => d.trim())
      .filter(Boolean)
      .slice(0, MAX_DOCS)
    setLoading(true)
    setAnswer("")
    setSources([])
    setActive(null)
    setError("")

    try {
      const reranked = await rerank(apiKey, { query, documents })
      const top = (reranked.data?.[0]?.result ?? []).slice(0, TOP_K).map((r) => ({
        ...r,
        document: documents[r.document_id] ?? "",
      }))
      setSources(top)

      const context = top
        .map((s, i) => `[${i + 1}] ${s.document}`)
        .join("\n\n")
      const messages: ChatMessage[] = [
        { role: "system", content: RAG_SYSTEM_PROMPT },
        {
          role: "user",
          content: `# 資料\n${context}\n\n# 質問\n${query}`,
        },
      ]

      for await (const chunk of streamChat(apiKey, { model, messages })) {
        setAnswer((prev) => prev + chunk.content)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  // Convert bare citations like [1] into links while leaving real Markdown
  // links ([1](url)) and reference-style links ([text][1]) untouched.
  const answerWithLinks = answer.replace(
    /\[(\d+)\]/g,
    (match: string, n: string, offset: number, str: string) => {
      if (str[offset + match.length] === "(") return match
      const prevBracket = str.slice(0, offset).match(/\[([^\]]*)\]$/)
      if (prevBracket && !/^\d+$/.test(prevBracket[1])) return match
      return `[${n}](#source-${n})`
    }
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">RAG（検索・回答）</h1>
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          チャットに戻る
        </Link>
      </header>
      <main className="p-4 max-w-6xl mx-auto space-y-4">
        <div>
          <label className="block text-sm mb-2">質問</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-3"
            placeholder="質問を入力"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">資料（空行区切り・最大{MAX_DOCS}件）</label>
          <textarea
            value={docs}
            onChange={(e) => setDocs(e.target.value)}
            rows={8}
            className="w-full bg-slate-900 border border-slate-700 rounded p-3 font-mono text-sm"
            placeholder={"資料1\n\n資料2"}
          />
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded disabled:bg-slate-700"
        >
          {loading ? "処理中..." : "検索して回答"}
        </button>

        {error && (
          <div className="text-sm text-red-400 border border-red-800 rounded p-3">
            {error}
          </div>
        )}

        {(answer || sources.length > 0) && (
          <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
            <section className="min-w-0">
              <h2 className="text-sm font-medium text-slate-400 mb-2">回答</h2>
              <article className="markdown text-sm text-slate-100">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    a: ({ href, children }) => {
                      if (href?.startsWith("#source-")) {
                        const n = href.replace("#source-", "")
                        return (
                          <a
                            href={href}
                            onClick={(e) => {
                              e.preventDefault()
                              scrollToSource(n)
                            }}
                            className="text-blue-400 hover:underline cursor-pointer"
                          >
                            {children}
                          </a>
                        )
                      }
                      return (
                        <a href={href} target="_blank" rel="noreferrer">
                          {children}
                        </a>
                      )
                    },
                  }}
                >
                  {answerWithLinks}
                </ReactMarkdown>
              </article>
            </section>
            <aside className="space-y-3">
              <h2 className="text-sm font-medium text-slate-400 mb-2">
                引用元
              </h2>
              {sources.map((s, i) => (
                <SourceCitation
                  key={i}
                  index={i + 1}
                  excerpt={s.document}
                  relevance={s.score}
                  active={active === String(i + 1)}
                />
              ))}
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

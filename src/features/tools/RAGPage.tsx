import { useState } from "react"
import { Link } from "react-router-dom"
import { useSettingsStore } from "@/store/useSettingsStore"
import { embedText, rerank } from "@/lib/api/sarashina"

export default function RAGPage() {
  const { apiKey } = useSettingsStore()
  const [query, setQuery] = useState("")
  const [docs, setDocs] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim() || !docs.trim() || !apiKey) return
    const documents = docs.split("\n\n").filter((d) => d.trim())
    setLoading(true)
    try {
      await embedText(apiKey, query)
      const reranked = await rerank(apiKey, { query, documents })
      setResults(reranked.results || [])
    } catch (e) {
      alert(`エラー: ${e}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">RAG（検索・再ランキング）</h1>
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          チャットに戻る
        </Link>
      </header>
      <main className="p-4 max-w-4xl mx-auto space-y-4">
        <div>
          <label className="block text-sm mb-2">クエリ</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-3"
            placeholder="検索クエリ"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">文書（空行区切り）</label>
          <textarea
            value={docs}
            onChange={(e) => setDocs(e.target.value)}
            rows={10}
            className="w-full bg-slate-900 border border-slate-700 rounded p-3 font-mono text-sm"
            placeholder="文書1\n\n文書2"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded disabled:bg-slate-700"
        >
          {loading ? "処理中..." : "検索・再ランキング"}
        </button>
        {results.length > 0 && (
          <div className="space-y-3 mt-4">
            {results.map((r, i) => (
              <div key={i} className="bg-slate-900 border border-slate-700 rounded p-3">
                <div className="text-xs text-slate-400 mb-1">
                  index: {r.index} / score: {r.score}
                </div>
                <div className="text-sm whitespace-pre-wrap">{r.document}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

import { useState } from "react"
import { Link } from "react-router-dom"
import { useSettingsStore } from "@/store/useSettingsStore"
import { guard, type GuardResult } from "@/lib/api/sarashina"

export default function GuardPage() {
  const { apiKey } = useSettingsStore()
  const [text, setText] = useState("")
  const [result, setResult] = useState<GuardResult | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    if (!text.trim() || !apiKey) return
    setLoading(true)
    setResult(null)
    setError("")
    try {
      const res = await guard(apiKey, text)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Guard（安全性判定）</h1>
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          チャットに戻る
        </Link>
      </header>
      <main className="p-4 max-w-3xl mx-auto space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="w-full bg-slate-900 border border-slate-700 rounded p-3"
          placeholder="判定したいテキストを入力"
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          className="bg-blue-600 px-4 py-2 rounded disabled:bg-slate-700"
        >
          {loading ? "判定中..." : "判定"}
        </button>
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-200 rounded p-3 text-sm whitespace-pre-wrap">
            エラー: {error}
          </div>
        )}
        {result && (
          <div className="bg-slate-900 border border-slate-700 rounded p-4 space-y-2">
            <div
              className={`inline-flex items-center rounded px-3 py-1 text-sm font-medium ${
                result.safe
                  ? "bg-green-950 text-green-300"
                  : "bg-red-950 text-red-300"
              }`}
            >
              {result.safe ? "安全" : "有害"}
            </div>
            {!result.safe && result.categories.length > 0 && (
              <div className="text-sm text-slate-300">
                カテゴリ: {result.categories.join(", ")}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

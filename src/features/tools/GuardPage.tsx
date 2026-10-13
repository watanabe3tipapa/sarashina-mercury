import { useState } from "react"
import { Link } from "react-router-dom"
import { useSettingsStore } from "@/store/useSettingsStore"
import { guard } from "@/lib/api/sarashina"

export default function GuardPage() {
  const { apiKey } = useSettingsStore()
  const [text, setText] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCheck = async () => {
    if (!text.trim() || !apiKey) return
    setLoading(true)
    try {
      const res = await guard(apiKey, text)
      setResult(res)
    } catch (e) {
      setResult({ error: String(e) })
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
        {result && (
          <pre className="bg-slate-900 border border-slate-700 rounded p-3 overflow-auto text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </main>
    </div>
  )
}

import { useState } from "react"
import { Link } from "react-router-dom"
import { useSettingsStore } from "@/store/useSettingsStore"
import { translate } from "@/lib/api/sarashina"

export default function TranslatePage() {
  const { apiKey } = useSettingsStore()
  const [text, setText] = useState("")
  const [result, setResult] = useState("")
  const [direction, setDirection] = useState<"ja-en" | "en-ja">("ja-en")
  const [tone, setTone] = useState("business-casual")
  const [loading, setLoading] = useState(false)

  const handleTranslate = async () => {
    if (!text.trim() || !apiKey) return
    setLoading(true)
    try {
      const res = await translate(apiKey, { text, direction, tone })
      setResult(res.translated_text || JSON.stringify(res))
    } catch (e) {
      setResult(`エラー: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">翻訳</h1>
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          チャットに戻る
        </Link>
      </header>
      <main className="flex-1 p-4 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="flex gap-2 mb-2 flex-wrap">
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as "ja-en" | "en-ja")}
                className="bg-slate-900 border border-slate-700 rounded p-2"
              >
                <option value="ja-en">日本語→英語</option>
                <option value="en-ja">英語→日本語</option>
              </select>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded p-2"
              >
                <option value="business-formal">business-formal</option>
                <option value="business-casual">business-casual</option>
                <option value="technical">technical</option>
                <option value="marketing">marketing</option>
              </select>
              <button
                onClick={handleTranslate}
                disabled={loading || !apiKey}
                className="bg-blue-600 px-4 py-2 rounded disabled:bg-slate-700"
              >
                {loading ? "翻訳中..." : "翻訳"}
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="原文を入力"
              rows={20}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono"
            />
          </div>
          <div>
            <h2 className="mb-2 text-sm text-slate-400">訳文</h2>
            <div className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 h-[500px] overflow-auto whitespace-pre-wrap">
              {result}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Loader2, RefreshCw, WifiOff } from "lucide-react"
import { useSettingsStore } from "@/store/useSettingsStore"
import { guard, type GuardResult } from "@/lib/api/sarashina"
import GuardNotice from "@/components/GuardNotice"

export default function GuardPage() {
  const { apiKey } = useSettingsStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [text, setText] = useState("")
  const [result, setResult] = useState<GuardResult | null>(null)
  const [error, setError] = useState("")
  const [offline, setOffline] = useState(false)
  const [loading, setLoading] = useState(false)

  const runCheck = async () => {
    if (!text.trim() || !apiKey || loading) return
    setLoading(true)
    setResult(null)
    setError("")
    setOffline(false)
    try {
      const res = await guard(apiKey, text)
      setResult(res)
    } catch (e) {
      // fetch() rejects with a TypeError when the network is unreachable.
      setOffline(e instanceof TypeError)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleRevise = () => {
    const el = textareaRef.current
    if (!el) return
    el.focus()
    el.setSelectionRange(0, el.value.length)
    el.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const handleReset = () => {
    setResult(null)
    setError("")
    setOffline(false)
    textareaRef.current?.focus()
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
        <p className="text-sm text-slate-400">
          入力テキスト（または生成結果）の安全性を <code>sarashina3-guard</code> で判定します。ブロックではなく、安心して使うためのガイドとして提示します。
        </p>

        {!apiKey && (
          <div className="text-sm text-yellow-400 border border-yellow-800 rounded p-3">
            API キーが未設定です。
            <Link to="/settings" className="ml-1 underline hover:text-yellow-300">
              設定
            </Link>
            から登録してください。
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="guard-text" className="block text-sm text-slate-400">
            判定するテキスト
          </label>
          <textarea
            id="guard-text"
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            className="w-full bg-slate-900 border border-slate-700 rounded p-3"
            placeholder="判定したいテキストを入力"
          />
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{text.length} 文字</span>
            {(result || error) && (
              <button
                type="button"
                onClick={handleReset}
                className="hover:text-slate-300"
              >
                結果をクリア
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runCheck}
            disabled={loading || !apiKey || !text.trim()}
            className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded text-sm font-medium disabled:bg-slate-700 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "判定中..." : "判定"}
          </button>
        </div>

        {error && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-red-950 border border-red-800 text-red-200 rounded p-3 text-sm">
            <div className="flex min-w-0 items-start gap-2">
              {offline && <WifiOff size={16} className="mt-0.5 shrink-0" />}
              <span className="whitespace-pre-wrap">
                {offline
                  ? "ネットワークに接続できませんでした。通信環境を確認してください。"
                  : `エラー: ${error}`}
              </span>
            </div>
            <button
              type="button"
              onClick={runCheck}
              disabled={loading}
              className="flex shrink-0 items-center gap-2 rounded border border-red-700 px-3 py-1.5 text-xs hover:bg-red-900 disabled:opacity-60"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              再試行
            </button>
          </div>
        )}

        {result && (
          <GuardNotice
            result={result}
            onRevise={handleRevise}
            onRetry={runCheck}
            retrying={loading}
          />
        )}
      </main>
    </div>
  )
}

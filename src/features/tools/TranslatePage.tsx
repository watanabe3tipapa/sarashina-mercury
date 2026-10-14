import { useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeftRight, Check, Copy, Loader2, Trash2 } from "lucide-react"
import { useSettingsStore } from "@/store/useSettingsStore"
import { translate } from "@/lib/api/sarashina"
import { EditorPane, type EditorPaneHandle } from "@/components/editor/EditorPane"

type Direction = "ja-en" | "en-ja"

const TONES = [
  { id: "business-formal", label: "ビジネス正式" },
  { id: "business-casual", label: "ビジネスカジュアル" },
  { id: "technical", label: "技術" },
  { id: "marketing", label: "マーケティング" },
] as const

export default function TranslatePage() {
  const { apiKey } = useSettingsStore()
  const sourceRef = useRef<EditorPaneHandle>(null)
  const targetRef = useRef<EditorPaneHandle>(null)
  const [direction, setDirection] = useState<Direction>("ja-en")
  const [tone, setTone] = useState<string>("business-casual")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const [syncIndex, setSyncIndex] = useState<number | null>(null)

  const sourceLang = direction === "ja-en" ? "日本語" : "英語"
  const targetLang = direction === "ja-en" ? "英語" : "日本語"

  const handleTranslate = async () => {
    if (loading) return
    const paragraphs = (sourceRef.current?.getParagraphs() ?? [])
      .map((p) => p.trim())
      .filter(Boolean)
    const text = paragraphs.join("\n\n")
    if (!text || !apiKey) return

    setLoading(true)
    setError("")
    setCopied(false)
    setSyncIndex(null)

    try {
      const res = await translate(apiKey, { text, direction, tone })
      const out = (res.translated_text ?? "").trim()
      const outParagraphs = out
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
      targetRef.current?.setParagraphs(outParagraphs.length ? outParagraphs : [""])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const handleSwap = () => {
    const source = sourceRef.current?.getParagraphs() ?? []
    const target = targetRef.current?.getParagraphs() ?? []
    sourceRef.current?.setParagraphs(target.length ? target : [""])
    targetRef.current?.setParagraphs(source.length ? source : [""])
    setDirection((d) => (d === "ja-en" ? "en-ja" : "ja-en"))
    setError("")
  }

  const handleCopy = async () => {
    const text = targetRef.current?.getText() ?? ""
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard may be unavailable (e.g. insecure context)
    }
  }

  const handleClear = () => {
    sourceRef.current?.clear()
    targetRef.current?.clear()
    setError("")
    setCopied(false)
    setSyncIndex(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">翻訳エディタ</h1>
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          チャットに戻る
        </Link>
      </header>

      <main className="p-4 max-w-6xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={direction}
            onChange={(e) => setDirection(e.target.value as Direction)}
            className="bg-slate-900 border border-slate-700 rounded p-2 text-sm"
            aria-label="翻訳方向"
          >
            <option value="ja-en">日本語 → 英語</option>
            <option value="en-ja">英語 → 日本語</option>
          </select>

          <div
            role="group"
            aria-label="トーン"
            className="flex flex-wrap rounded border border-slate-700 overflow-hidden"
          >
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                aria-pressed={tone === t.id}
                className={`px-3 py-2 text-sm ${
                  tone === t.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleTranslate}
            disabled={loading || !apiKey}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded px-4 py-2 text-sm font-medium text-white flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? "翻訳中..." : "翻訳"}
          </button>

          <button
            type="button"
            onClick={handleSwap}
            className="bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded px-3 py-2 text-sm flex items-center gap-2"
            title="原文と訳文を入れ替え"
          >
            <ArrowLeftRight size={16} />
            入れ替え
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded px-3 py-2 text-sm flex items-center gap-2"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "コピー済み" : "訳文をコピー"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded px-3 py-2 text-sm flex items-center gap-2"
          >
            <Trash2 size={16} />
            クリア
          </button>
        </div>

        {!apiKey && (
          <div className="text-sm text-yellow-400 border border-yellow-800 rounded p-3">
            API キーが未設定です。設定から登録してください。
          </div>
        )}

        {error && (
          <div className="text-sm text-red-400 border border-red-800 rounded p-3">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-slate-400">原文（{sourceLang}）</h2>
              <span className="text-xs text-slate-500">Cmd/Ctrl + Enter で翻訳</span>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900">
              <EditorPane
                ref={sourceRef}
                ariaLabel="原文"
                placeholder="原文を入力..."
                highlightIndex={syncIndex}
                onParagraphHover={setSyncIndex}
                onSubmitShortcut={handleTranslate}
              />
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-slate-400">訳文（{targetLang}・編集可）</h2>
              <span className="text-xs text-slate-500">段落にカーソルを合わせると対応箇所を強調</span>
            </div>
            <div className="rounded-lg border border-slate-700 bg-slate-900">
              <EditorPane
                ref={targetRef}
                ariaLabel="訳文"
                placeholder="ここに訳文が表示されます（直接編集できます）"
                highlightIndex={syncIndex}
                onParagraphHover={setSyncIndex}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

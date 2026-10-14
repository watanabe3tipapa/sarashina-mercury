import { Link } from "react-router-dom"
import { useSettingsStore } from "@/store/useSettingsStore"
import type { ThemePreference } from "@/lib/theme"

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "システム" },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
]

export default function SettingsPage() {
  const {
    apiKey,
    model,
    systemPrompt,
    sessionOnlyKey,
    theme,
    setApiKey,
    setModel,
    setSystemPrompt,
    setSessionOnlyKey,
    setTheme,
  } = useSettingsStore()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Settings</h1>
        <Link to="/" className="text-sm text-slate-400 hover:text-slate-200">
          Back
        </Link>
      </header>
      <main className="p-4 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">API設定</h2>
            <p className="text-sm text-slate-400 mb-4">
              Sarashina API キーはローカル（ブラウザ）にのみ保存され、サーバーへは送信されません。
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-slate-700 bg-slate-900 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={sessionOnlyKey}
                onChange={(e) => setSessionOnlyKey(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-blue-500"
              />
              <span className="text-sm">
                <span className="font-medium text-slate-200">
                  このセッションだけ API キーを保持する
                </span>
                <span className="mt-1 block text-slate-400">
                  {sessionOnlyKey
                    ? "タブを閉じる（またはブラウザを終了する）と API キーは消去されます。次回は再入力が必要です。"
                    : "オフの場合は API キーがブラウザに保存され、次回起動時に自動で復元されます。"}
                </span>
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="sarashina3-mini">sarashina3-mini</option>
                <option value="sarashina3-nano">sarashina3-nano</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                システムプロンプト
              </label>
              <p className="text-sm text-slate-400 mb-2">
                すべてのチャットで先頭に付与される指示です（会話履歴には保存されません）。
              </p>
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                rows={6}
                placeholder="例: あなたは丁寧な日本語で回答するアシスタントです。"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-4 text-sm text-slate-400">
              <p>Mercury Editor スタイルで Sarashina を活用する PWA ツール</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">外観</h2>
            <p className="text-sm text-slate-400 mb-4">
              「システム」を選ぶと OS のライト / ダーク設定に自動で追従します。
            </p>
            <div
              role="radiogroup"
              aria-label="テーマ"
              className="inline-flex rounded-lg border border-slate-700 p-1"
            >
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={theme === option.value}
                  onClick={() => setTheme(option.value)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    theme === option.value
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

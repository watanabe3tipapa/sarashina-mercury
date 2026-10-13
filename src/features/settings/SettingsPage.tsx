import { Link } from "react-router-dom"
import { useSettingsStore } from "@/store/useSettingsStore"

export default function SettingsPage() {
  const { apiKey, model, systemPrompt, setApiKey, setModel, setSystemPrompt } =
    useSettingsStore()

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
              Sarashina APIキーはローカル（ブラウザ）にのみ保存されます。
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
              <p>Mercury EditorスタイルでSarashina AIを活用するPWAツール</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

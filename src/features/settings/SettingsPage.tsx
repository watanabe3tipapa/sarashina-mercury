import { Link } from "react-router-dom"
import { useSettingsStore } from "@/store/useSettingsStore"

export default function SettingsPage() {
  const { apiKey, model, setApiKey, setModel } = useSettingsStore()

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

            <div className="pt-4 text-sm text-slate-400">
              <p>Mercury EditorスタイルでSarashina AIを活用するPWAツール</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

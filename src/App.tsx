import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ChatPage from "./features/chat/ChatPage"
import { useThemeSync } from "./hooks/useThemeSync"

// Tool pages are code-split so the heavy editor (Lexical) stays out of the
// initial bundle.
const SettingsPage = lazy(() => import("./features/settings/SettingsPage"))
const TranslatePage = lazy(() => import("./features/tools/TranslatePage"))
const RAGPage = lazy(() => import("./features/tools/RAGPage"))
const GuardPage = lazy(() => import("./features/tools/GuardPage"))

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/"

function PageFallback() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center text-sm">
      読み込み中...
    </div>
  )
}

function App() {
  useThemeSync()
  return (
    <BrowserRouter basename={basename}>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/translate" element={<TranslatePage />} />
          <Route path="/rag" element={<RAGPage />} />
          <Route path="/guard" element={<GuardPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App

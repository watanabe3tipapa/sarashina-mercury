import { BrowserRouter, Routes, Route } from "react-router-dom"
import ChatPage from "./features/chat/ChatPage"
import SettingsPage from "./features/settings/SettingsPage"
import TranslatePage from "./features/tools/TranslatePage"
import RAGPage from "./features/tools/RAGPage"
import GuardPage from "./features/tools/GuardPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/translate" element={<TranslatePage />} />
        <Route path="/rag" element={<RAGPage />} />
        <Route path="/guard" element={<GuardPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { useSettingsStore } from "@/store/useSettingsStore"
import { streamChat, type ChatMessage } from "@/lib/api/sarashina"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { MessageSquare, Languages, Search, Shield, Settings } from "lucide-react"

export default function ChatPage() {
  const { apiKey, model } = useSettingsStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !apiKey || isLoading) return

    const userMessage: ChatMessage = { role: "user", content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    const assistantMessage: ChatMessage = { role: "assistant", content: "" }
    setMessages([...newMessages, assistantMessage])

    try {
      for await (const chunk of streamChat(apiKey, {
        model,
        messages: newMessages,
      })) {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last.role === "assistant") {
            last.content += chunk.content
          }
          return updated
        })
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last.role === "assistant") {
          last.content = `エラー: ${error instanceof Error ? error.message : "不明なエラー"}`
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <aside className="w-64 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-lg font-bold">Sarashina Mercury</h1>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <Link to="/" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <MessageSquare size={18} />
            <span>チャット</span>
          </Link>
          <Link to="/translate" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <Languages size={18} />
            <span>翻訳</span>
          </Link>
          <Link to="/rag" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <Search size={18} />
            <span>RAG</span>
          </Link>
          <Link to="/guard" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800">
            <Shield size={18} />
            <span>Guard</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-2 p-2 rounded hover:bg-slate-800 mt-4">
            <Settings size={18} />
            <span>設定</span>
          </Link>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 p-4 md:hidden flex justify-between items-center">
          <h1 className="text-xl font-bold">Sarashina Mercury</h1>
          <Link to="/settings" className="text-sm text-slate-400 hover:text-slate-200">
            Settings
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto">
          {!apiKey && (
            <div className="p-4 text-center text-yellow-400">
              APIキーが未設定です。設定から登録してください。
            </div>
          )}
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-100"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "assistant" && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <div className="border-t border-slate-800 p-4">
          <div className="max-w-4xl mx-auto flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={apiKey ? "メッセージを入力..." : "APIキーを設定してください"}
              disabled={!apiKey || isLoading}
              rows={2}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              disabled={!apiKey || !input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg px-6 py-2 text-white font-medium"
            >
              送信
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

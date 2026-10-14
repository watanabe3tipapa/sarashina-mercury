import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { useSettingsStore } from "@/store/useSettingsStore"
import { useChatStore, type StoredMessage } from "@/store/useChatStore"
import { streamChat, type ChatMessage } from "@/lib/api/sarashina"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  MessageSquare,
  Languages,
  Search,
  Shield,
  Settings,
  Plus,
  Trash2,
} from "lucide-react"

const EMPTY_MESSAGES: StoredMessage[] = []

export default function ChatPage() {
  const { apiKey, model, systemPrompt } = useSettingsStore()
  const {
    conversations,
    currentId,
    ready,
    init,
    newChat,
    select,
    remove,
    setMessages,
    persist,
  } = useChatStore()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const current = conversations.find((c) => c.id === currentId)
  const messages = current ? current.messages : EMPTY_MESSAGES

  useEffect(() => {
    void init(model)
  }, [init, model])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const latestMessages = (id: string) =>
    useChatStore.getState().conversations.find((c) => c.id === id)?.messages ?? []

  const updateLastAssistant = (
    id: string,
    update: (content: string) => string
  ) => {
    const next = latestMessages(id).map((m) => ({ ...m }))
    const last = next[next.length - 1]
    if (last?.role === "assistant") {
      last.content = update(last.content)
      setMessages(id, next)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !apiKey || isLoading || !current) return

    const conversationId = current.id
    const userMessage: StoredMessage = { role: "user", content: input }
    const history = [...current.messages, userMessage]

    setMessages(conversationId, [...history, { role: "assistant", content: "" }])
    setInput("")
    setIsLoading(true)
    await persist(conversationId)

    const requestMessages: ChatMessage[] = []
    if (systemPrompt.trim()) {
      requestMessages.push({ role: "system", content: systemPrompt })
    }
    requestMessages.push(...history)

    try {
      for await (const chunk of streamChat(apiKey, {
        model,
        messages: requestMessages,
      })) {
        updateLastAssistant(conversationId, (content) => content + chunk.content)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー"
      updateLastAssistant(conversationId, () => `エラー: ${message}`)
    } finally {
      setIsLoading(false)
      await persist(conversationId)
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
        <nav className="p-2 space-y-1">
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
        </nav>

        <div className="px-2 pb-2">
          <button
            onClick={() => newChat(model)}
            className="w-full flex items-center gap-2 p-2 rounded border border-slate-700 hover:bg-slate-800 text-sm"
          >
            <Plus size={16} />
            <span>新しい会話</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center rounded ${
                c.id === currentId ? "bg-slate-800" : "hover:bg-slate-800/60"
              }`}
            >
              <button
                onClick={() => select(c.id)}
                className="flex-1 text-left p-2 text-sm truncate"
                title={c.title}
              >
                {c.title}
              </button>
              <button
                onClick={() => void remove(c.id, model)}
                className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
                aria-label="会話を削除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-slate-800">
          <Link
            to="/settings"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-800"
          >
            <Settings size={18} />
            <span>設定</span>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-800 md:hidden">
          <div className="p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Sarashina Mercury</h1>
            <Link to="/settings" className="text-sm text-slate-400 hover:text-slate-200">
              Settings
            </Link>
          </div>
          <div className="px-4 pb-3 flex gap-2">
            <select
              value={currentId ?? ""}
              onChange={(e) => select(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-sm"
            >
              {conversations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => newChat(model)}
              className="p-2 rounded border border-slate-700"
              aria-label="新しい会話"
            >
              <Plus size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {!apiKey && (
            <div className="p-4 text-center text-yellow-400">
              APIキーが未設定です。設定から登録してください。
            </div>
          )}
          {ready && messages.length === 0 && (
            <div className="p-4 text-center text-slate-500 text-sm">
              メッセージを入力して会話を始めましょう。
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
                    <div className="markdown text-sm">
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

import { useState, useRef, useEffect } from "react"
import { Link } from "react-router-dom"
import { useSettingsStore } from "@/store/useSettingsStore"
import { useChatStore, type StoredMessage } from "@/store/useChatStore"
import {
  streamChat,
  guard,
  isAbortError,
  type ChatMessage,
  type GuardResult,
} from "@/lib/api/sarashina"
import GuardNotice from "@/components/GuardNotice"
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
  Loader2,
  Square,
} from "lucide-react"

const EMPTY_MESSAGES: StoredMessage[] = []

export default function ChatPage() {
  const { apiKey, model, systemPrompt, guardInput, guardOutput } =
    useSettingsStore()
  const {
    conversations,
    currentId,
    ready,
    storageError,
    init,
    newChat,
    select,
    remove,
    setMessages,
    persist,
  } = useChatStore()
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [guardChecking, setGuardChecking] = useState(false)
  const [blockedInput, setBlockedInput] = useState<{
    text: string
    result: GuardResult
  } | null>(null)
  const [outputGuards, setOutputGuards] = useState<Record<number, GuardResult>>(
    {}
  )
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const current = conversations.find((c) => c.id === currentId)
  const messages = current ? current.messages : EMPTY_MESSAGES

  const [guardedConversationId, setGuardedConversationId] = useState(currentId)
  if (guardedConversationId !== currentId) {
    setGuardedConversationId(currentId)
    setBlockedInput(null)
    setOutputGuards({})
  }

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

  const performSend = async (text: string) => {
    if (!apiKey || !current) return

    const conversationId = current.id
    const userMessage: StoredMessage = { role: "user", content: text }
    const history = [...latestMessages(conversationId), userMessage]

    setMessages(conversationId, [...history, { role: "assistant", content: "" }])
    setInput("")
    setBlockedInput(null)
    setIsLoading(true)
    await persist(conversationId)

    const requestMessages: ChatMessage[] = []
    if (systemPrompt.trim()) {
      requestMessages.push({ role: "system", content: systemPrompt })
    }
    requestMessages.push(...history)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      for await (const chunk of streamChat(
        apiKey,
        { model, messages: requestMessages },
        controller.signal
      )) {
        updateLastAssistant(conversationId, (content) => content + chunk.content)
      }
    } catch (error) {
      if (isAbortError(error)) {
        const msgs = latestMessages(conversationId)
        const last = msgs[msgs.length - 1]
        if (last?.role === "assistant" && !last.content.trim()) {
          updateLastAssistant(conversationId, () => "（停止しました）")
        }
      } else {
        const message = error instanceof Error ? error.message : "不明なエラー"
        updateLastAssistant(conversationId, () => `エラー: ${message}`)
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
      await persist(conversationId)
    }

    if (!controller.signal.aborted && guardOutput) {
      const msgs = latestMessages(conversationId)
      const lastIndex = msgs.length - 1
      const content = msgs[lastIndex]?.content?.trim()
      if (content && !content.startsWith("エラー:")) {
        try {
          const result = await guard(apiKey, content)
          if (!result.safe) {
            setOutputGuards((prev) => ({ ...prev, [lastIndex]: result }))
          }
        } catch {
          // 出力後の Guard は補助的なので失敗しても無視する
        }
      }
    }
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || !apiKey || isLoading || guardChecking || !current) return

    if (guardInput) {
      setGuardChecking(true)
      try {
        const result = await guard(apiKey, text)
        if (!result.safe) {
          setBlockedInput({ text, result })
          return
        }
      } catch {
        // Guard が失敗した場合は送信を優先する（補助機能）
      } finally {
        setGuardChecking(false)
      }
    }

    await performSend(text)
  }

  const retryInputGuard = async () => {
    if (!apiKey || !blockedInput) return
    setGuardChecking(true)
    try {
      const result = await guard(apiKey, blockedInput.text)
      if (result.safe) {
        await performSend(blockedInput.text)
      } else {
        setBlockedInput({ text: blockedInput.text, result })
      }
    } catch {
      // ignore
    } finally {
      setGuardChecking(false)
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
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
            <span>翻訳エディタ</span>
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
              API キーが未設定です。設定から登録してください。
            </div>
          )}
          {storageError && (
            <div className="p-3 m-4 text-sm text-amber-300 border border-amber-800 rounded bg-amber-950/40">
              履歴の保存に失敗しました。このセッションの会話は保存されません（プライベートモードや
              IndexedDB が無効な環境ではこの表示が出ます）。
            </div>
          )}
          {ready && messages.length === 0 && (
            <div className="p-4 text-center text-slate-500 text-sm">
              メッセージを入力して会話を始めましょう。
            </div>
          )}
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {messages.map((message, i) => (
              <div key={i}>
                <div
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
                {outputGuards[i] && (
                  <div className="mt-2 max-w-[85%]">
                    <GuardNotice result={outputGuards[i]} compact />
                  </div>
                )}
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
          {blockedInput && (
            <div className="max-w-4xl mx-auto mb-3">
              <GuardNotice
                result={blockedInput.result}
                onRevise={() => textareaRef.current?.focus()}
                onRetry={() => void retryInputGuard()}
                onProceed={() => void performSend(blockedInput.text)}
                proceedLabel="このまま送信"
                retrying={guardChecking}
              />
            </div>
          )}
          <div className="max-w-4xl mx-auto flex gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={apiKey ? "メッセージを入力..." : "API キーを設定してください"}
              disabled={!apiKey || isLoading}
              rows={2}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {isLoading ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 rounded-lg px-6 py-2 text-white font-medium"
              >
                <Square size={16} />
                停止
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!apiKey || !input.trim() || guardChecking}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg px-6 py-2 text-white font-medium"
              >
                {guardChecking && <Loader2 size={16} className="animate-spin" />}
                {guardChecking ? "確認中..." : "送信"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

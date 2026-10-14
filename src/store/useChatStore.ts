import { create } from "zustand"
import {
  getAllConversations,
  putConversation,
  deleteConversation,
  type Conversation,
  type StoredMessage,
} from "@/lib/db/conversations"

export type { Conversation, StoredMessage }

function newConversation(model: string): Conversation {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: "新しい会話",
    model,
    messages: [],
    createdAt: now,
    updatedAt: now,
  }
}

function titleFromContent(content: string): string {
  const firstLine = content.trim().split("\n")[0] ?? ""
  if (!firstLine) return "新しい会話"
  return firstLine.length > 30 ? `${firstLine.slice(0, 30)}…` : firstLine
}

interface ChatState {
  conversations: Conversation[]
  currentId: string | null
  ready: boolean
  initialized: boolean
  storageError: string | null
  init: (model: string) => Promise<void>
  newChat: (model: string) => void
  select: (id: string) => void
  remove: (id: string, model: string) => Promise<void>
  setMessages: (id: string, messages: StoredMessage[]) => void
  persist: (id: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentId: null,
  ready: false,
  initialized: false,
  storageError: null,

  init: async (model) => {
    if (get().initialized) return
    set({ initialized: true })

    try {
      const conversations = await getAllConversations()
      if (conversations.length > 0) {
        set({ conversations, currentId: conversations[0].id, ready: true })
        return
      }

      const conv = newConversation(model)
      await putConversation(conv)
      set({ conversations: [conv], currentId: conv.id, ready: true })
    } catch (error) {
      // Persistent storage can be unavailable (private mode, blocked cookies,
      // quota exceeded). Fall back to an in-memory session so the app still
      // works, and surface a notice instead of hanging on an empty screen.
      const conv = newConversation(model)
      set({
        conversations: [conv],
        currentId: conv.id,
        ready: true,
        storageError: error instanceof Error ? error.message : String(error),
      })
    }
  },

  newChat: (model) => {
    const conv = newConversation(model)
    void putConversation(conv).catch(() => {})
    set((state) => ({
      conversations: [conv, ...state.conversations],
      currentId: conv.id,
    }))
  },

  select: (id) => set({ currentId: id }),

  remove: async (id, model) => {
    try {
      await deleteConversation(id)
    } catch {
      // Best-effort: keep the in-memory list consistent even if the delete fails.
    }
    const remaining = get().conversations.filter((c) => c.id !== id)
    if (remaining.length === 0) {
      const conv = newConversation(model)
      void putConversation(conv).catch(() => {})
      set({ conversations: [conv], currentId: conv.id })
      return
    }
    set({
      conversations: remaining,
      currentId: get().currentId === id ? remaining[0].id : get().currentId,
    })
  },

  setMessages: (id, messages) => {
    set((state) => ({
      conversations: state.conversations.map((c) => {
        if (c.id !== id) return c
        const title =
          c.messages.length === 0 && messages[0]?.role === "user"
            ? titleFromContent(messages[0].content)
            : c.title
        return { ...c, title, messages, updatedAt: Date.now() }
      }),
    }))
  },

  persist: async (id) => {
    const conv = get().conversations.find((c) => c.id === id)
    if (!conv) return
    try {
      await putConversation(conv)
    } catch {
      // Best-effort: the conversation stays in memory for this session.
    }
  },
}))

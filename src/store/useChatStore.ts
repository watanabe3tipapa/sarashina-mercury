import { create } from "zustand"
import {
  getAllConversations,
  putConversation,
  deleteConversation,
  type Conversation,
  type StoredMessage,
} from "@/lib/db/conversations"

export type { Conversation, StoredMessage }

let initStarted = false

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

  init: async (model) => {
    if (initStarted) return
    initStarted = true

    const conversations = await getAllConversations()
    if (conversations.length > 0) {
      set({ conversations, currentId: conversations[0].id, ready: true })
      return
    }

    const conv = newConversation(model)
    await putConversation(conv)
    set({ conversations: [conv], currentId: conv.id, ready: true })
  },

  newChat: (model) => {
    const conv = newConversation(model)
    void putConversation(conv)
    set((state) => ({
      conversations: [conv, ...state.conversations],
      currentId: conv.id,
    }))
  },

  select: (id) => set({ currentId: id }),

  remove: async (id, model) => {
    await deleteConversation(id)
    const remaining = get().conversations.filter((c) => c.id !== id)
    if (remaining.length === 0) {
      const conv = newConversation(model)
      await putConversation(conv)
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
    if (conv) await putConversation(conv)
  },
}))

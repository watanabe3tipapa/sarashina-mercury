import { create } from "zustand"
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware"
import { DEFAULT_PRICES_YEN_PER_MILLION } from "@/lib/tokens"
import type { ThemePreference } from "@/lib/theme"

const STORAGE_KEY = "sarashina-settings"
const SESSION_API_KEY = "sarashina-session-api-key"

// Routes the API key to sessionStorage when the user opts into session-only
// storage, while everything else keeps living in localStorage. The key is
// therefore dropped when the browser session ends instead of persisting.
export const selectiveStorage: StateStorage = {
  getItem: (name) => {
    const local = localStorage.getItem(name)
    if (!local) return null
    try {
      const parsed = JSON.parse(local)
      if (parsed?.state?.sessionOnlyKey) {
        parsed.state.apiKey = sessionStorage.getItem(SESSION_API_KEY) ?? ""
      }
      return JSON.stringify(parsed)
    } catch {
      return local
    }
  },
  setItem: (name, value) => {
    const parsed = JSON.parse(value)
    const state = parsed.state ?? {}
    if (state.sessionOnlyKey) {
      sessionStorage.setItem(SESSION_API_KEY, state.apiKey ?? "")
      state.apiKey = ""
    } else {
      sessionStorage.removeItem(SESSION_API_KEY)
    }
    parsed.state = state
    localStorage.setItem(name, JSON.stringify(parsed))
  },
  removeItem: (name) => {
    localStorage.removeItem(name)
    sessionStorage.removeItem(SESSION_API_KEY)
  },
}

interface SettingsState {
  apiKey: string
  model: string
  systemPrompt: string
  sessionOnlyKey: boolean
  theme: ThemePreference
  pricePerMillion: Record<string, number>
  budgetYen: number
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  setSystemPrompt: (prompt: string) => void
  setSessionOnlyKey: (sessionOnly: boolean) => void
  setTheme: (theme: ThemePreference) => void
  setPricePerMillion: (model: string, yen: number) => void
  setBudgetYen: (yen: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      model: "sarashina3-mini",
      systemPrompt: "",
      sessionOnlyKey: false,
      theme: "system",
      pricePerMillion: DEFAULT_PRICES_YEN_PER_MILLION,
      budgetYen: 0,
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setSessionOnlyKey: (sessionOnlyKey) => set({ sessionOnlyKey }),
      setTheme: (theme) => set({ theme }),
      setPricePerMillion: (model, yen) =>
        set((s) => ({ pricePerMillion: { ...s.pricePerMillion, [model]: yen } })),
      setBudgetYen: (budgetYen) => set({ budgetYen }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => selectiveStorage),
    }
  )
)

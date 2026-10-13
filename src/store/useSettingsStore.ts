import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DEFAULT_PRICES_YEN_PER_MILLION } from "@/lib/tokens"

interface SettingsState {
  apiKey: string
  model: string
  systemPrompt: string
  pricePerMillion: Record<string, number>
  budgetYen: number
  setApiKey: (key: string) => void
  setModel: (model: string) => void
  setSystemPrompt: (prompt: string) => void
  setPricePerMillion: (model: string, yen: number) => void
  setBudgetYen: (yen: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      model: "sarashina3-mini",
      systemPrompt: "",
      pricePerMillion: DEFAULT_PRICES_YEN_PER_MILLION,
      budgetYen: 0,
      setApiKey: (apiKey) => set({ apiKey }),
      setModel: (model) => set({ model }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setPricePerMillion: (model, yen) =>
        set((s) => ({ pricePerMillion: { ...s.pricePerMillion, [model]: yen } })),
      setBudgetYen: (budgetYen) => set({ budgetYen }),
    }),
    {
      name: "sarashina-settings",
    }
  )
)

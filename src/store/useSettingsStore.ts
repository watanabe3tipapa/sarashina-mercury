import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SettingsState {
  apiKey: string
  model: string
  setApiKey: (key: string) => void
  setModel: (model: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: "",
      model: "sarashina3-mini",
      setApiKey: (key) => set({ apiKey: key }),
      setModel: (model) => set({ model }),
    }),
    {
      name: "sarashina-settings",
    }
  )
)

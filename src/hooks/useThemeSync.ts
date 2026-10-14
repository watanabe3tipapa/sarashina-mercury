import { useEffect } from "react"
import { useSettingsStore } from "@/store/useSettingsStore"
import { applyTheme, watchSystemTheme } from "@/lib/theme"

// Applies the stored theme preference to the document and keeps it in sync
// with the OS colour scheme while the preference is "system".
export function useThemeSync() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    applyTheme(theme)
    if (theme !== "system") return
    return watchSystemTheme(() => applyTheme("system"))
  }, [theme])
}

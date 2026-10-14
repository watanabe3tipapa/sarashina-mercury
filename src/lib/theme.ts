export type ThemePreference = "system" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

const LIGHT_QUERY = "(prefers-color-scheme: light)"

export function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined" || !window.matchMedia) return "dark"
  return window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark"
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? systemTheme() : preference
}

export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference)
  if (typeof document !== "undefined") {
    const root = document.documentElement
    root.dataset.theme = resolved
    root.style.colorScheme = resolved
    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute("content", resolved === "light" ? "#f8fafc" : "#020617")
  }
  return resolved
}

// Calls the handler whenever the OS colour scheme changes, so a "system"
// preference can update live. Returns an unsubscribe function.
export function watchSystemTheme(handler: (theme: ResolvedTheme) => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {}
  const media = window.matchMedia(LIGHT_QUERY)
  const listener = (event: MediaQueryListEvent) => handler(event.matches ? "light" : "dark")
  media.addEventListener("change", listener)
  return () => media.removeEventListener("change", listener)
}

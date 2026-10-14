import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { resolveTheme, applyTheme, systemTheme, watchSystemTheme } from './theme'

type Listener = (event: MediaQueryListEvent) => void

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<Listener>()
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_type: string, cb: Listener) => listeners.add(cb),
    removeEventListener: (_type: string, cb: Listener) => listeners.delete(cb),
    addListener: (cb: Listener) => listeners.add(cb),
    removeListener: (cb: Listener) => listeners.delete(cb),
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
  return listeners
}

describe('theme', () => {
  beforeEach(() => {
    document.head.innerHTML = '<meta name="theme-color" content="#020617" />'
    delete document.documentElement.dataset.theme
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('resolves explicit preferences without touching the OS setting', () => {
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
  })

  it('follows prefers-color-scheme for the system preference', () => {
    mockMatchMedia(true)
    expect(systemTheme()).toBe('light')
    expect(resolveTheme('system')).toBe('light')

    mockMatchMedia(false)
    expect(systemTheme()).toBe('dark')
    expect(resolveTheme('system')).toBe('dark')
  })

  it('applies the resolved theme to the document', () => {
    mockMatchMedia(false)
    applyTheme('light')

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.style.colorScheme).toBe('light')
    expect(
      document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
    ).toBe('#f8fafc')
  })

  it('notifies subscribers when the OS scheme changes', () => {
    const listeners = mockMatchMedia(false)
    const handler = vi.fn()
    const unsubscribe = watchSystemTheme(handler)

    listeners.forEach((cb) =>
      cb({ matches: true } as MediaQueryListEvent),
    )
    expect(handler).toHaveBeenCalledWith('light')

    unsubscribe()
    expect(listeners.size).toBe(0)
  })
})

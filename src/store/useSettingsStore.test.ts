import { describe, it, expect, beforeEach } from 'vitest'
import { selectiveStorage } from './useSettingsStore'

const NAME = 'test-settings'
const SESSION_API_KEY = 'sarashina-session-api-key'

function stored(apiKey: string, sessionOnlyKey: boolean) {
  return JSON.stringify({ state: { apiKey, sessionOnlyKey }, version: 0 })
}

function read() {
  return JSON.parse((selectiveStorage.getItem(NAME) as string) ?? '{}')
}

describe('selectiveStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('keeps the API key in localStorage when session-only is off', () => {
    selectiveStorage.setItem(NAME, stored('secret', false))

    const local = JSON.parse(localStorage.getItem(NAME) ?? '{}')
    expect(local.state.apiKey).toBe('secret')
    expect(sessionStorage.getItem(SESSION_API_KEY)).toBeNull()

    const roundTrip = read()
    expect(roundTrip.state.apiKey).toBe('secret')
  })

  it('routes the API key to sessionStorage when session-only is on', () => {
    selectiveStorage.setItem(NAME, stored('secret', true))

    const local = JSON.parse(localStorage.getItem(NAME) ?? '{}')
    expect(local.state.apiKey).toBe('')
    expect(local.state.sessionOnlyKey).toBe(true)
    expect(sessionStorage.getItem(SESSION_API_KEY)).toBe('secret')

    const roundTrip = read()
    expect(roundTrip.state.apiKey).toBe('secret')
  })

  it('drops a session-only key once the session storage is gone', () => {
    selectiveStorage.setItem(NAME, stored('secret', true))
    sessionStorage.clear()

    const roundTrip = read()
    expect(roundTrip.state.apiKey).toBe('')
  })

  it('removes the session key when switching back to persistent storage', () => {
    selectiveStorage.setItem(NAME, stored('secret', true))
    selectiveStorage.setItem(NAME, stored('secret', false))

    expect(sessionStorage.getItem(SESSION_API_KEY)).toBeNull()
    const local = JSON.parse(localStorage.getItem(NAME) ?? '{}')
    expect(local.state.apiKey).toBe('secret')
  })

  it('clears both stores on removeItem', () => {
    selectiveStorage.setItem(NAME, stored('secret', true))
    selectiveStorage.removeItem(NAME)

    expect(localStorage.getItem(NAME)).toBeNull()
    expect(sessionStorage.getItem(SESSION_API_KEY)).toBeNull()
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useChatStore } from './useChatStore'

describe('useChatStore storage fallback', () => {
  beforeEach(() => {
    useChatStore.setState({
      conversations: [],
      currentId: null,
      ready: false,
      initialized: false,
      storageError: null,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('falls back to an in-memory conversation when IndexedDB is unavailable', async () => {
    vi.stubGlobal('indexedDB', undefined)

    await useChatStore.getState().init('sarashina3-mini')

    const state = useChatStore.getState()
    expect(state.ready).toBe(true)
    expect(state.storageError).toBeTruthy()
    expect(state.conversations).toHaveLength(1)
    expect(state.currentId).toBe(state.conversations[0].id)
  })
})

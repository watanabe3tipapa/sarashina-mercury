import { describe, it, expect, vi, afterEach } from 'vitest'
import { guard, streamChat, isAbortError } from './sarashina'

describe('guard', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('parses 安全 response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '安全',
            },
          },
        ],
      }),
    } as any))

    const res = await guard('key', 'hello')
    expect(res.safe).toBe(true)
    expect(res.categories).toEqual([])
  })

  it('parses 有害 with T codes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '有害\nT8',
            },
          },
        ],
      }),
    } as any))

    const res = await guard('key', 'forbidden')
    expect(res.safe).toBe(false)
    expect(res.categories).toContain('T8')
  })

  it('extracts multiple T codes', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '有害\nT1, T2',
            },
          },
        ],
      }),
    } as any))

    const res = await guard('key', 'forbidden')
    expect(res.safe).toBe(false)
    expect(res.categories).toEqual(expect.arrayContaining(['T1', 'T2']))
  })
})

function streamResponse(chunks: string[]) {
  const encoder = new TextEncoder()
  return {
    ok: true,
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
        controller.close()
      },
    }),
  } as any
}

describe('streamChat', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('yields streamed content deltas', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        streamResponse([
          'data: {"choices":[{"delta":{"content":"Hel"}}]}\n',
          'data: {"choices":[{"delta":{"content":"lo"}}]}\n',
          'data: [DONE]\n',
        ])
      )
    )

    const out: string[] = []
    for await (const chunk of streamChat('key', { model: 'm', messages: [] })) {
      out.push(chunk.content)
    }
    expect(out.join('')).toBe('Hello')
  })

  it('forwards the abort signal to fetch', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          const signal = init?.signal as AbortSignal | undefined
          signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          )
        })
    )
    vi.stubGlobal('fetch', fetchMock)

    const consume = (async () => {
      for await (const _chunk of streamChat(
        'key',
        { model: 'm', messages: [] },
        controller.signal
      )) {
        void _chunk
      }
    })()

    controller.abort()
    await expect(consume).rejects.toMatchObject({ name: 'AbortError' })
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(controller.signal)
  })
})

describe('isAbortError', () => {
  it('detects abort errors', () => {
    expect(isAbortError(new DOMException('x', 'AbortError'))).toBe(true)
    expect(isAbortError(new Error('boom'))).toBe(false)
    expect(isAbortError('nope')).toBe(false)
  })
})

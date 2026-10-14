import { describe, it, expect, vi, afterEach } from 'vitest'
import { guard } from './sarashina'

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

import { describe, it, expect } from 'vitest'
import { estimateTokens, estimateCost } from './tokens'

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0)
  })

  it('estimates reasonable values for mixed text', () => {
    const t = 'こんにちは world' // CJK + ASCII
    const v = estimateTokens(t)
    expect(v).toBeGreaterThan(0)
    expect(v).toBeLessThan(20)
  })

  it('returns >=1 for non-empty', () => {
    expect(estimateTokens('a')).toBeGreaterThanOrEqual(1)
  })
})

describe('estimateCost', () => {
  it('computes cost correctly', () => {
    expect(estimateCost(1000, 10000)).toBe(10)
    expect(estimateCost(0, 10000)).toBe(0)
  })
})

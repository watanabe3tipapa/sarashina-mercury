import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GuardNotice from './GuardNotice'
import type { GuardResult } from '@/lib/api/sarashina'

describe('GuardNotice', () => {
  it('shows safe result', () => {
    const result: GuardResult = { safe: true, categories: [], raw: '安全' }
    render(<GuardNotice result={result} onRevise={() => {}} onRetry={() => {}} retrying={false} />)
    expect(screen.getByText('安全性チェックを通過しました')).toBeInTheDocument()
    expect(screen.getByText('安全')).toBeInTheDocument()
  })

  it('shows harmful result with category', () => {
    const result: GuardResult = { safe: false, categories: ['T8'], raw: '有害\nT8' }
    render(<GuardNotice result={result} onRevise={() => {}} onRetry={() => {}} retrying={false} />)
    expect(screen.getByText('表現を調整すると安全に使えます')).toBeInTheDocument()
    expect(screen.getByText('違法行為の幇助')).toBeInTheDocument()
    expect(screen.getByText('T8')).toBeInTheDocument()
  })
})

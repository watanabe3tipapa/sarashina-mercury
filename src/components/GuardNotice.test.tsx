import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('invokes onProceed when proceeding despite a harmful result', () => {
    const result: GuardResult = { safe: false, categories: ['T8'], raw: '有害\nT8' }
    const onProceed = vi.fn()
    render(
      <GuardNotice
        result={result}
        onProceed={onProceed}
        proceedLabel="このまま送信"
      />
    )
    fireEvent.click(screen.getByText('このまま送信'))
    expect(onProceed).toHaveBeenCalledOnce()
  })

  it('renders no actions in compact mode', () => {
    const result: GuardResult = { safe: false, categories: ['T8'], raw: '有害\nT8' }
    render(<GuardNotice result={result} compact />)
    expect(screen.queryByText('別の表現を試す')).not.toBeInTheDocument()
    expect(screen.queryByText('もう一度判定')).not.toBeInTheDocument()
  })
})

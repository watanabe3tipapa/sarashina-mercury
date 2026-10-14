import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

function boom(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <span>ok</span>
      </ErrorBoundary>
    )
    expect(screen.getByText('ok')).toBeInTheDocument()
  })

  it('renders a fallback and recovers on retry', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    let shouldThrow = true
    function Maybe() {
      if (shouldThrow) boom()
      return <span>recovered</span>
    }

    render(
      <ErrorBoundary>
        <Maybe />
      </ErrorBoundary>
    )
    expect(screen.getByText('問題が発生しました')).toBeInTheDocument()

    shouldThrow = false
    fireEvent.click(screen.getByText('再試行'))
    expect(screen.getByText('recovered')).toBeInTheDocument()
  })
})

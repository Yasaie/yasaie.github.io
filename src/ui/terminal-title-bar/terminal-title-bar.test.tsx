import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TerminalTitleBar } from './terminal-title-bar'

afterEach(() => vi.useRealTimers())

describe('the bar above the terminal', () => {
  it('names the machine and the shell the visitor is talking to', () => {
    render(<TerminalTitleBar />)
    expect(screen.getByText('payam@yasaie.com — zsh')).toBeInTheDocument()
  })

  it('shows the time where the machine lives, not where the visitor does', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T23:05:00Z'))

    render(<TerminalTitleBar />)

    expect(screen.getByText('00:05 CET')).toBeInTheDocument()
  })
})

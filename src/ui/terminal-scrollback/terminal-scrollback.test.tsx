import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { blank, text } from '@/tty/line/line'
import { TerminalScrollback } from './terminal-scrollback'

describe('the printed history of the session', () => {
  it('prints every line in the order the machine wrote it', () => {
    const { container } = render(
      <TerminalScrollback
        lines={[text('payam@yasaie ~ $ whoami', 'faint'), text('Payam Yasaie', 'text'), blank]}
      >
        <input aria-label="command" />
      </TerminalScrollback>,
    )
    expect([...container.querySelectorAll('span')].map((part) => part.textContent)).toEqual([
      'payam@yasaie ~ $ whoami',
      'Payam Yasaie',
    ])
  })

  it('announces new output politely, without interrupting what is being read', () => {
    render(
      <TerminalScrollback lines={[text('Payam Yasaie', 'text')]}>
        <input aria-label="command" />
      </TerminalScrollback>,
    )
    expect(screen.getByText('Payam Yasaie').closest('[aria-live]')).toHaveAttribute(
      'aria-live',
      'polite',
    )
  })

  it('keeps the prompt with the output rather than announcing it as new text', () => {
    render(
      <TerminalScrollback lines={[text('Payam Yasaie', 'text')]}>
        <input aria-label="command" />
      </TerminalScrollback>,
    )
    expect(screen.getByLabelText('command').closest('[aria-live]')).toBeNull()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { blank, text } from '@/tty/line/line'
import { TerminalScrollback } from './terminal-scrollback'

describe('the printed history of the session', () => {
  it('prints every line in the order the machine wrote it', () => {
    const { container } = render(
      <TerminalScrollback
        lines={[text('payam@yasaie ~ $ whoami', 'faint'), text('Payam Yasaie', 'text'), blank]}
        onRun={() => undefined}
      />,
    )
    expect([...container.querySelectorAll('span')].map((part) => part.textContent)).toEqual([
      'payam@yasaie ~ $ whoami',
      'Payam Yasaie',
    ])
  })

  it('announces new output politely, without interrupting what is being read', () => {
    render(<TerminalScrollback lines={[text('Payam Yasaie', 'text')]} onRun={() => undefined} />)
    expect(screen.getByText('Payam Yasaie').closest('[aria-live]')).toHaveAttribute(
      'aria-live',
      'polite',
    )
  })
})

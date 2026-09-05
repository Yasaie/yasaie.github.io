import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { blank, text } from '@/tty/line/line'
import { TerminalScrollback } from './terminal-scrollback'

describe('the printed history of the session', () => {
  it('prints every line in the order the machine wrote it', () => {
    const { container } = render(
      <TerminalScrollback
        lines={[text('payam@yasaie ~ $ whoami', 'faint'), text('Payam Yasaie', 'text'), blank]}
      />,
    )
    expect([...container.querySelectorAll('span')].map((part) => part.textContent)).toEqual([
      'payam@yasaie ~ $ whoami',
      'Payam Yasaie',
    ])
  })

  it('announces new output politely, without interrupting what is being read', () => {
    const { container } = render(<TerminalScrollback lines={[text('Payam Yasaie', 'text')]} />)
    expect(container.firstElementChild).toHaveAttribute('aria-live', 'polite')
  })

  it('scrolls on its own rather than pushing the prompt off the screen', () => {
    const { container } = render(<TerminalScrollback lines={[text('Payam Yasaie', 'text')]} />)
    expect(container.firstElementChild).toHaveClass('overflow-auto')
  })
})

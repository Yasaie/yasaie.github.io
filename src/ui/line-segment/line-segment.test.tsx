import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { link, segment } from '@/tty/line/line'
import { LineSegment } from './line-segment'

describe('a coloured piece of a printed line', () => {
  it('prints the text it was given, spaces and all', () => {
    render(<LineSegment segment={segment('uptime  ', 'muted')} />)
    expect(screen.getByText('uptime', { exact: false }).textContent).toBe('uptime  ')
  })

  it('paints each of the terminal colours with its own theme colour', () => {
    const { container } = render(
      <>
        <LineSegment segment={segment('accent', 'accent')} />
        <LineSegment segment={segment('text', 'text')} />
        <LineSegment segment={segment('body', 'body')} />
        <LineSegment segment={segment('muted', 'muted')} />
        <LineSegment segment={segment('faint', 'faint')} />
      </>,
    )
    expect([...container.querySelectorAll('span')].map((span) => span.className)).toEqual([
      'text-terminal-accent',
      'text-terminal-text',
      'text-terminal-body',
      'text-terminal-muted',
      'text-terminal-faint',
    ])
  })
})

describe('a piece of a line that points somewhere', () => {
  const address = link('payam@yasaie.com', 'text', 'mailto:payam@yasaie.com')

  const holds = (): void => {
    fireEvent.keyDown(window, { key: 'Meta', metaKey: true })
  }

  it('reads as ordinary text, so the screen stays a terminal and not a web page', () => {
    render(<LineSegment segment={address} />)

    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('payam@yasaie.com')).toBeInTheDocument()
  })

  it('becomes a link only while the visitor holds the key that follows one', () => {
    render(<LineSegment segment={address} />)

    holds()

    expect(screen.getByRole('link', { name: 'payam@yasaie.com' })).toHaveAttribute(
      'href',
      'mailto:payam@yasaie.com',
    )
  })

  it('opens in a new tab, so the terminal the visitor was reading is still there', () => {
    render(<LineSegment segment={address} />)

    holds()

    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
  })

  it('is text again the moment the key comes up', () => {
    render(<LineSegment segment={address} />)

    holds()
    fireEvent.keyUp(window, { key: 'Meta' })

    expect(screen.queryByRole('link')).toBeNull()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { segment } from '@/tty/line/line'
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

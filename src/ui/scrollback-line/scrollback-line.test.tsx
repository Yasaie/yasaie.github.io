import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { responsive, row, segment, text, wordmark } from '@/tty/line/line'
import { ScrollbackLine } from './scrollback-line'

const rowsIn = (container: HTMLElement): readonly HTMLElement[] => [
  ...container.querySelectorAll('div'),
]

describe('a plain printed line', () => {
  it('prints its pieces side by side, in the order the machine wrote them', () => {
    const { container } = render(
      <ScrollbackLine
        line={{
          kind: 'plain',
          row: row([segment('[1]  ', 'muted'), segment('GoodHabitz', 'text')]),
        }}
      />,
    )
    expect(container.textContent).toBe('[1]  GoodHabitz')
  })

  it('keeps the indent the machine asked for, so bullets sit under their heading', () => {
    const { container } = render(<ScrollbackLine line={text('- full stack.', 'body', '2ch')} />)
    expect(rowsIn(container).at(0)?.style.paddingLeft).toBe('2ch')
  })

  it('wraps long output instead of running off the screen', () => {
    const { container } = render(<ScrollbackLine line={text('a very long answer', 'body')} />)
    expect(rowsIn(container).at(0)).toHaveClass('whitespace-pre-wrap')
  })
})

describe('a line that reads differently on a narrow screen', () => {
  const line = responsive(row([segment('uptime  ', 'muted'), segment('16 years', 'body')]), [
    row([segment('uptime', 'muted')]),
    row([segment('16 years', 'body')], '2ch'),
  ])

  it('carries both the padded row and the stacked rows, so a resize needs no reprint', () => {
    const { container } = render(<ScrollbackLine line={line} />)
    expect(rowsIn(container).map((each) => each.textContent)).toEqual([
      'uptime  16 years',
      'uptime',
      '16 years',
    ])
  })

  it('shows the padded row only from the breakpoint up and the stacked rows only below it', () => {
    const { container } = render(<ScrollbackLine line={line} />)
    const [padded, key, value] = rowsIn(container)
    expect(padded).toHaveClass('hidden', 'min-[600px]:block')
    expect(key).toHaveClass('min-[600px]:hidden')
    expect(value).toHaveClass('min-[600px]:hidden')
  })
})

describe('a line of the boot wordmark', () => {
  it('keeps every space of the block art, so the glyphs butt together', () => {
    const { container } = render(<ScrollbackLine line={wordmark(' ╚████╔╝  ')} />)
    expect(container.textContent).toBe(' ╚████╔╝  ')
    expect(rowsIn(container).at(0)).toHaveClass('whitespace-pre')
  })

  it('is drawn in the accent colour, in the font whose blocks have no seams', () => {
    const { container } = render(<ScrollbackLine line={wordmark('██╗   ██╗')} />)
    expect(rowsIn(container).at(0)).toHaveClass('font-wordmark')
    expect(container.querySelector('span')).toHaveClass('text-terminal-accent')
  })
})

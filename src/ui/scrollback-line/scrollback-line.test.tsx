import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { responsive, row, segment, text, wordmark } from '@/tty/line/line'
import { colourClass } from '@/tty/palette/palette'
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

  it('prints a long answer whole, leaving the screen to wrap it', () => {
    const long = 'a very long answer that will not fit across one line of any terminal'
    const { container } = render(<ScrollbackLine line={text(long, 'body')} />)
    expect(container.textContent).toBe(long)
  })

  it('still takes up a line when the machine prints nothing, so output keeps its spacing', () => {
    const { container } = render(<ScrollbackLine line={text('', 'body')} />)
    expect(rowsIn(container)).toHaveLength(1)
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

  it('offers the two readings as alternatives, so only one of them is ever on screen', () => {
    const { container } = render(<ScrollbackLine line={line} />)
    const [padded, key, value] = rowsIn(container)
    expect(padded?.className).not.toBe(key?.className)
    expect(key?.className).toBe(value?.className)
  })
})

describe('a line of the boot wordmark', () => {
  it('keeps every space of the block art, so the glyphs butt together', () => {
    const { container } = render(<ScrollbackLine line={wordmark(' ╚████╔╝  ')} />)
    expect(container.textContent).toBe(' ╚████╔╝  ')
  })

  it('is drawn in the accent colour, like everything the machine wants read first', () => {
    const { container } = render(<ScrollbackLine line={wordmark('██╗   ██╗')} />)
    expect(container.querySelector('span')).toHaveClass(colourClass.accent)
  })
})

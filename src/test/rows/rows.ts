import type { Output } from '@/kernel/app/app'
import type { Line, Row } from '@/tty/line/line'
import { row, segment } from '@/tty/line/line'
import type { Colour } from '@/tty/palette/palette'

export type Layout = 'wide' | 'narrow'

const rowsIn = (line: Line, layout: Layout): readonly Row[] => {
  switch (line.kind) {
    case 'plain':
      return [line.row]
    case 'responsive':
      return layout === 'wide' ? [line.wide] : line.narrow
    case 'wordmark':
      return [row([segment(line.text, 'accent')])]
  }
}

const rowsOf = (output: Output, layout: Layout = 'wide'): readonly Row[] =>
  output.lines.flatMap((line) => rowsIn(line, layout))

export const textOf = (output: Output, layout: Layout = 'wide'): readonly string[] =>
  rowsOf(output, layout).map((each) => each.segments.map((part) => part.text).join(''))

export const coloursOf = (
  output: Output,
  layout: Layout = 'wide',
): readonly (readonly Colour[])[] =>
  rowsOf(output, layout).map((each) => each.segments.map((part) => part.colour))

export const indentsOf = (output: Output, layout: Layout = 'wide'): readonly string[] =>
  rowsOf(output, layout).map((each) => each.indent)

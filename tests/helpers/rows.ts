import type { Output } from '@/kernel/contract/contract'
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

export type Printed = Output | readonly Line[]

const linesOf = (printed: Printed): readonly Line[] =>
  'lines' in printed ? printed.lines : printed

const rowsOf = (printed: Printed, layout: Layout = 'wide'): readonly Row[] =>
  linesOf(printed).flatMap((line) => rowsIn(line, layout))

export const textOf = (printed: Printed, layout: Layout = 'wide'): readonly string[] =>
  rowsOf(printed, layout).map((each) => each.segments.map((part) => part.text).join(''))

export const coloursOf = (
  printed: Printed,
  layout: Layout = 'wide',
): readonly (readonly Colour[])[] =>
  rowsOf(printed, layout).map((each) => each.segments.map((part) => part.colour))

export const indentsOf = (printed: Printed, layout: Layout = 'wide'): readonly string[] =>
  rowsOf(printed, layout).map((each) => each.indent)

export const linksOf = (
  printed: Printed,
  layout: Layout = 'wide',
): readonly (readonly [string, string])[] =>
  rowsOf(printed, layout).flatMap((each) =>
    each.segments.flatMap((part) =>
      part.href === undefined ? [] : [[part.text, part.href] as const],
    ),
  )

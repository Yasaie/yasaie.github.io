import { coloursOf, type Layout, textOf } from '@/test/rows/rows'
import type { Line } from '@/tty/line/line'
import type { Colour } from '@/tty/palette/palette'

const printed = (lines: readonly Line[]) => ({ lines, effects: [] })

export const screenText = (lines: readonly Line[], layout: Layout = 'wide'): readonly string[] =>
  textOf(printed(lines), layout)

export const screenColours = (
  lines: readonly Line[],
  layout: Layout = 'wide',
): readonly (readonly Colour[])[] => coloursOf(printed(lines), layout)

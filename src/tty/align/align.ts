import { type Line, link, responsive, row, segment } from '@/tty/line/line'
import type { Colour } from '@/tty/palette/palette'

export type KeyValuePair = {
  readonly key: string
  readonly value: string
  readonly valueColour?: Colour
  readonly href?: string
}

export type KeyValueColours = {
  readonly key: Colour
  readonly value: Colour
}

const keyGutter = 2
const stackedValueIndent = '2ch'

export const widestLength = (values: readonly string[]): number =>
  values.reduce((widest, value) => Math.max(widest, value.length), 0)

export const padRight = (value: string, width: number): string => value.padEnd(width)

export const padLeft = (value: string, width: number): string => value.padStart(width)

export const keyValueBlock = (
  pairs: readonly KeyValuePair[],
  colours: KeyValueColours,
): readonly Line[] => {
  const keyWidth = widestLength(pairs.map((pair) => pair.key)) + keyGutter
  return Object.freeze(
    pairs.map(({ key, value, valueColour, href }) => {
      const colour = valueColour ?? colours.value
      const shown = href === undefined ? segment(value, colour) : link(value, colour, href)
      return responsive(row([segment(padRight(key, keyWidth), colours.key), shown]), [
        row([segment(key, colours.key)]),
        row([shown], stackedValueIndent),
      ])
    }),
  )
}

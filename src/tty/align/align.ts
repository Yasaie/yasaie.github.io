import { type Line, responsive, row, segment } from '@/tty/line/line'
import type { Colour } from '@/tty/palette/palette'

export type KeyValuePair = {
  readonly key: string
  readonly value: string
  readonly valueColour?: Colour
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
    pairs.map(({ key, value, valueColour }) => {
      const colour = valueColour ?? colours.value
      return responsive(
        row([segment(padRight(key, keyWidth), colours.key), segment(value, colour)]),
        [row([segment(key, colours.key)]), row([segment(value, colour)], stackedValueIndent)],
      )
    }),
  )
}

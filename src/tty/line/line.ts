import type { Colour } from '@/tty/palette/palette'

export type Segment = {
  readonly text: string
  readonly colour: Colour
}

export type Row = {
  readonly segments: readonly Segment[]
  readonly indent: string
}

export type Line =
  | { readonly kind: 'plain'; readonly row: Row }
  | { readonly kind: 'responsive'; readonly wide: Row; readonly narrow: readonly Row[] }
  | { readonly kind: 'wordmark'; readonly text: string }

const noIndent = '0'

export const segment = (text: string, colour: Colour): Segment => Object.freeze({ text, colour })

export const row = (segments: readonly Segment[], indent: string = noIndent): Row =>
  Object.freeze({ segments: Object.freeze(segments), indent })

export const plain = (line: Row): Line => Object.freeze({ kind: 'plain', row: line })

export const text = (value: string, colour: Colour, indent: string = noIndent): Line =>
  plain(row([segment(value, colour)], indent))

export const blank: Line = plain(row([]))

export const responsive = (wide: Row, narrow: readonly Row[]): Line =>
  Object.freeze({ kind: 'responsive', wide, narrow: Object.freeze(narrow) })

export const wordmark = (value: string): Line => Object.freeze({ kind: 'wordmark', text: value })

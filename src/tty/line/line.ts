import type { Colour } from '@/tty/palette/palette'

export type Segment = {
  readonly text: string
  readonly colour: Colour
  readonly href?: string
}

export type Row = {
  readonly segments: readonly Segment[]
  readonly indent: string
}

export type Line =
  | { readonly kind: 'plain'; readonly row: Row; readonly runs?: string }
  | {
      readonly kind: 'responsive'
      readonly wide: Row
      readonly narrow: readonly Row[]
      readonly runs?: string
    }
  | { readonly kind: 'wordmark'; readonly text: string }

export type PlainLine = Extract<Line, { readonly kind: 'plain' }>

export type ResponsiveLine = Extract<Line, { readonly kind: 'responsive' }>

export type Runnable = PlainLine | ResponsiveLine

const noIndent = '0'

export const segment = (text: string, colour: Colour): Segment => Object.freeze({ text, colour })

export const link = (text: string, colour: Colour, href: string): Segment =>
  Object.freeze({ text, colour, href })

export const row = (segments: readonly Segment[], indent: string = noIndent): Row =>
  Object.freeze({ segments: Object.freeze(segments), indent })

export const plain = (line: Row): PlainLine => Object.freeze({ kind: 'plain', row: line })

export const text = (value: string, colour: Colour, indent: string = noIndent): PlainLine =>
  plain(row([segment(value, colour)], indent))

export const blank: PlainLine = plain(row([]))

export const responsive = (wide: Row, narrow: readonly Row[]): ResponsiveLine =>
  Object.freeze({ kind: 'responsive', wide, narrow: Object.freeze(narrow) })

export const wordmark = (value: string): Line => Object.freeze({ kind: 'wordmark', text: value })

export const runnable = (line: Runnable, command: string): Runnable =>
  Object.freeze({ ...line, runs: command })

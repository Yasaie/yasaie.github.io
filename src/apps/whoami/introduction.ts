import { documentBlocks } from '@/fs/document/document'
import { blank, type Line, type Row, responsive, row, segment, text } from '@/tty/line/line'
import type { Colour } from '@/tty/palette/palette'

const separator = ' · '

const untilFirstSeparator = (value: string): readonly string[] => {
  const at = value.indexOf(separator)
  return at === -1 ? [value] : [value.slice(0, at), value.slice(at + separator.length)]
}

const stacked = (parts: readonly string[], colour: Colour): readonly Row[] =>
  parts.map((part) => row([segment(part, colour)]))

const wideOrStacked = (value: string, colour: Colour, parts: readonly string[]): Line =>
  responsive(row([segment(value, colour)]), stacked(parts, colour))

export const introductionLines = (document: string): readonly Line[] => {
  const [intro = [], background = [], footing = []] = documentBlocks(document)
  const [fullName = '', headline = '', opening = ''] = intro
  const [languages = '', degree = ''] = footing
  return [
    text(fullName, 'text'),
    wideOrStacked(headline, 'body', untilFirstSeparator(headline)),
    text(opening, 'body'),
    blank,
    ...background.map((paragraph) => text(paragraph, 'body')),
    blank,
    wideOrStacked(languages, 'muted', languages.split(separator)),
    text(degree, 'muted'),
  ]
}

import { documentBlocks } from '@/fs/document/document'
import { homePath } from '@/fs/path/path'
import type { Volume } from '@/fs/volume/volume'
import type { App, Output } from '@/kernel/app/app'
import { blank, type Line, type Row, responsive, row, segment, text } from '@/tty/line/line'
import type { Colour } from '@/tty/palette/palette'

const whoamiPath = `${homePath}/whoami.txt`

const separator = ' · '

const untilFirstSeparator = (value: string): readonly string[] => {
  const at = value.indexOf(separator)
  return at === -1 ? [value] : [value.slice(0, at), value.slice(at + separator.length)]
}

const stacked = (parts: readonly string[], colour: Colour): readonly Row[] =>
  parts.map((part) => row([segment(part, colour)]))

const wideOrStacked = (value: string, colour: Colour, parts: readonly string[]): Line =>
  responsive(row([segment(value, colour)]), stacked(parts, colour))

const linesOf = (document: string): readonly Line[] => {
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

const render = (volume: Volume): Output => ({
  lines: linesOf(volume.require(whoamiPath)),
  effects: [],
})

export const whoami: App = {
  name: 'whoami',
  aliases: [],
  summary: 'who is typing on the other side',
  listed: 1,
  counted: true,
  handles: [whoamiPath],
  run: (_invocation, volume) => render(volume),
}

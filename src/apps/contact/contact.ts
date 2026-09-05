import { type ColumnPair, columnPairs } from '@/fs/document/document'
import { homePath } from '@/fs/path/path'
import type { Volume } from '@/fs/volume/volume'
import type { App, Output } from '@/kernel/app/app'
import { type KeyValuePair, keyValueBlock } from '@/tty/align/align'
import type { Colour } from '@/tty/palette/palette'

const contactPath = `${homePath}/contact.txt`

const emphasis: ReadonlyMap<string, Colour> = new Map([
  ['mail', 'text'],
  ['where', 'muted'],
])

const emphasised = (pair: ColumnPair): KeyValuePair => {
  const valueColour = emphasis.get(pair.key)
  return valueColour === undefined ? pair : { ...pair, valueColour }
}

const render = (volume: Volume): Output => {
  const document = volume.read(contactPath)
  return {
    lines:
      document === undefined
        ? []
        : keyValueBlock(columnPairs(document).map(emphasised), { key: 'muted', value: 'body' }),
    effects: [],
  }
}

export const contact: App = {
  name: 'contact',
  aliases: ['hi', 'hello'],
  summary: 'say hi',
  listed: 4,
  counted: true,
  handles: [contactPath],
  run: (_invocation, volume) => render(volume),
}

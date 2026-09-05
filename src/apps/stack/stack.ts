import { columnPairs } from '@/fs/document/document'
import { homePath } from '@/fs/path/path'
import type { Volume } from '@/fs/volume/volume'
import type { App, Output } from '@/kernel/app/app'
import { keyValueBlock } from '@/tty/align/align'

const stackPath = `${homePath}/stack.txt`

const render = (volume: Volume): Output => {
  const document = volume.read(stackPath)
  return {
    lines:
      document === undefined
        ? []
        : keyValueBlock(columnPairs(document), { key: 'muted', value: 'body' }),
    effects: [],
  }
}

export const stack: App = {
  name: 'stack',
  aliases: [],
  summary: 'what I build with',
  listed: 3,
  counted: true,
  handles: [stackPath],
  run: (_invocation, volume) => render(volume),
}

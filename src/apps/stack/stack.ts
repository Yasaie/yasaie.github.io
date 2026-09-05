import { columnPairs } from '@/fs/document/document'
import { homePath } from '@/fs/path/path'
import type { Volume } from '@/fs/volume/volume'
import type { App, Output } from '@/kernel/contract/contract'
import { keyValueBlock } from '@/tty/align/align'

const stackPath = `${homePath}/stack.txt`

const render = (volume: Volume): Output => ({
  lines: keyValueBlock(columnPairs(volume.require(stackPath)), { key: 'muted', value: 'body' }),
  effects: [],
})

export const stack: App = {
  name: 'stack',
  aliases: [],
  summary: 'what i build with',
  listed: 3,
  counted: true,
  handles: [stackPath],
  run: (_invocation, volume) => render(volume),
}

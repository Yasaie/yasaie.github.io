import type { App, Output } from '@/kernel/app/app'
import { text } from '@/tty/line/line'

const staying = Object.freeze({
  lines: [text('there is no exit. only  clear', 'muted')],
  effects: [],
} satisfies Output)

export const exit: App = {
  name: 'exit',
  aliases: [],
  summary: 'the way out, such as it is',
  listed: null,
  counted: false,
  handles: [],
  run: () => staying,
}

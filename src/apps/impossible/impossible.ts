import type { App, Output } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

const creed = Object.freeze({
  lines: [text('"nothing is impossible — only problems awaiting creative solutions."', 'accent')],
  effects: [],
} satisfies Output)

export const impossible: App = {
  name: 'impossible',
  aliases: [],
  summary: 'the line I keep on the wall',
  listed: null,
  counted: true,
  handles: [],
  run: () => creed,
}

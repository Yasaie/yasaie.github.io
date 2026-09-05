import type { App, Output } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

const brewed = Object.freeze({
  lines: [text('brewing… done. black, no sugar.', 'accent')],
  effects: [],
} satisfies Output)

export const coffee: App = {
  name: 'coffee',
  aliases: [],
  summary: 'the other dependency',
  listed: null,
  counted: true,
  handles: [],
  run: () => brewed,
}

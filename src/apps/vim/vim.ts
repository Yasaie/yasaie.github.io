import type { App, Output } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

const refused = Object.freeze({
  lines: [text('not installed. you would only have asked how to leave.', 'accent')],
  effects: [],
} satisfies Output)

export const vim: App = {
  name: 'vim',
  aliases: ['emacs', 'nano'],
  summary: 'the editor argument, settled',
  listed: null,
  counted: true,
  handles: [],
  run: () => refused,
}

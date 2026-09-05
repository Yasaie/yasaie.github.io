import type { App, Output } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

const declined = Object.freeze({
  lines: [text('no vim. you have the idea, i have the keyboard.', 'accent')],
  effects: [],
} satisfies Output)

export const vim: App = {
  name: 'vim',
  aliases: ['emacs', 'nano'],
  summary: 'the editor argument, settled',
  listed: null,
  counted: true,
  handles: [],
  run: () => declined,
}

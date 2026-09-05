import type { App, Output } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

const declined = Object.freeze({
  lines: [
    text('not installed. you would only have asked how to leave.', 'accent'),
    text(
      'and if you are reaching for an editor, you want something built — hand me that part.',
      'accent',
    ),
  ],
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

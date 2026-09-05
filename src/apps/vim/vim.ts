import type { App, Output } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

const declined = (name: string): Output => ({
  lines: [text(`no ${name}. bring the idea, i have the keyboard.`, 'accent')],
  effects: [],
})

export const vim: App = {
  name: 'vim',
  aliases: ['emacs', 'nano'],
  summary: 'the editor argument, settled',
  listed: null,
  counted: true,
  handles: [],
  run: (invocation) => declined(invocation.name),
}

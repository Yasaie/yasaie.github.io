import type { App, Output } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

const refused = Object.freeze({
  lines: [text('payam is not in the sudoers file. this incident will be reported.', 'accent')],
  effects: [],
} satisfies Output)

export const sudo: App = {
  name: 'sudo',
  aliases: [],
  summary: 'ask for privileges you do not have',
  listed: null,
  counted: true,
  handles: [],
  run: () => refused,
}

import type { App, Output } from '@/kernel/app/app'
import { text } from '@/tty/line/line'

const refused = Object.freeze({
  lines: [text('permission denied. respect, though.', 'accent')],
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

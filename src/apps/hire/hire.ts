import type { App, Output } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

const answer = Object.freeze({
  lines: [text('open to it. payam@yasaie.com', 'accent')],
  effects: [],
} satisfies Output)

export const hire: App = {
  name: 'hire',
  aliases: ['work-with-me'],
  summary: 'whether he is available',
  listed: null,
  counted: true,
  handles: [],
  run: () => answer,
}

import type { App, Output } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

const answer = Object.freeze({
  lines: [text('open to it. payam@yasaie.com — i read every one of them.', 'accent')],
  effects: [],
} satisfies Output)

export const hire: App = {
  name: 'hire',
  aliases: ['work-with-me'],
  summary: 'the question this whole thing is here to answer',
  listed: null,
  counted: true,
  handles: [],
  run: () => answer,
}

import type { App, Output } from '@/kernel/app/app'
import { text } from '@/tty/line/line'

const anyName = '*'

const complaint = (name: string): Output => ({
  lines: [text(`zsh: command not found: ${name}`, 'muted')],
  effects: [],
})

export const notFound: App = {
  name: 'not-found',
  aliases: [anyName],
  summary: 'answers for a program that is not installed',
  listed: null,
  counted: false,
  handles: [],
  run: (invocation) => complaint(invocation.name),
}

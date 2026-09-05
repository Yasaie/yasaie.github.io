import type { App, Output } from '@/kernel/app/app'
import { text } from '@/tty/line/line'

const origin = Object.freeze({
  lines: [
    text('38.08° N, 46.29° E. where it started. best kebab in iran, not up for debate.', 'accent'),
  ],
  effects: [],
} satisfies Output)

export const tabriz: App = {
  name: 'tabriz',
  aliases: [],
  summary: 'where it started',
  listed: null,
  counted: true,
  handles: [],
  run: () => origin,
}

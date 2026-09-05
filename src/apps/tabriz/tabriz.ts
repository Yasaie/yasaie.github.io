import type { App, Output } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

const origin = Object.freeze({
  lines: [
    text(
      '38.08° N, 46.29° E. where it started. carpets, the largest covered bazaar on earth, and iran’s first of nearly everything.',
      'accent',
    ),
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

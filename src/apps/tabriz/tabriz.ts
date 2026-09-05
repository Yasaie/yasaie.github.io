import type { App, Output } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

const origin = Object.freeze({
  lines: [
    text(
      '38.08° N, 46.29° E. 1,350 m up, cold most of the year. the largest covered bazaar on earth is there, and i still get lost in it.',
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

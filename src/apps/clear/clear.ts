import type { App, Output } from '@/kernel/app/app'

const wiped = Object.freeze({ lines: [], effects: [{ kind: 'clear' }] } satisfies Output)

export const clear: App = {
  name: 'clear',
  aliases: [],
  summary: 'wipe the screen',
  listed: 5,
  counted: false,
  handles: [],
  run: () => wiped,
}

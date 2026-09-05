import type { App, Output } from '@/kernel/contract/contract'

const wiped = Object.freeze({ lines: [], effects: [{ kind: 'clear' }] } satisfies Output)

export const clear: App = {
  name: 'clear',
  aliases: [],
  summary: 'wipe the screen',
  listed: null,
  counted: false,
  handles: [],
  run: () => wiped,
}

import { pathOf } from '@/fs/path/path'
import type { App } from '@/kernel/contract/contract'
import { text } from '@/tty/line/line'

export const pwd: App = {
  name: 'pwd',
  aliases: [],
  summary: 'print the working directory',
  listed: null,
  counted: false,
  handles: [],
  run: ({ cwd }) => ({ lines: [text(pathOf(cwd), 'body')], effects: [] }),
}

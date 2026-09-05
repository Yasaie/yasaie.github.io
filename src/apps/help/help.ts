import type { App, Output } from '@/kernel/app/app'
import { listedApps } from '@/kernel/registry/registry'
import { keyValueBlock } from '@/tty/align/align'
import { blank, text } from '@/tty/line/line'

const invitation = 'there are a few more. guess.'

const render = (): Output => ({
  lines: [
    ...keyValueBlock(
      listedApps.map((app) => ({ key: app.name, value: app.summary })),
      { key: 'text', value: 'body' },
    ),
    blank,
    text(invitation, 'muted'),
  ],
  effects: [],
})

export const help: App = {
  name: 'help',
  aliases: ['?'],
  summary: 'the listing you are reading',
  listed: null,
  counted: true,
  handles: [],
  run: render,
}

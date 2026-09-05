import type { App, Output } from '@/kernel/contract/contract'
import { padLeft } from '@/tty/align/align'
import { type Line, text } from '@/tty/line/line'

type Process = {
  readonly pid: string
  readonly command: string
}

const open: readonly Process[] = [
  { pid: '418', command: 'Lightroom' },
  { pid: '902', command: 'VLC' },
  { pid: '1173', command: 'BoardGameGeek' },
  { pid: '-', command: 'snooker' },
]

const selfPid = '2201'

const pidColumn = 5

const row = ({ pid, command }: Process): Line =>
  text(`${padLeft(pid, pidColumn)}  ${command}`, 'body')

const listing = (asked: string): Output => ({
  lines: [
    text(`${padLeft('PID', pidColumn)}  CMD`, 'muted'),
    ...open.map(row),
    row({ pid: selfPid, command: asked }),
  ],
  effects: [],
})

export const ps: App = {
  name: 'ps',
  aliases: ['top', 'htop', 'jobs'],
  summary: 'what else is running',
  listed: null,
  counted: true,
  handles: [],
  run: (invocation) => listing(invocation.name),
}

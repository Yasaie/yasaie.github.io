import { homePath, resolve, workPath } from '@/fs/path/path'
import type { App, Cwd, Output } from '@/kernel/app/app'
import { text } from '@/tty/line/line'

const unreachable: readonly string[] = ['/', '/root']

const documentSuffix = /\.(txt|md)$/

const reachable: Readonly<Record<string, Cwd>> = Object.freeze({
  [homePath]: '~',
  [workPath]: '~/work',
})

const refuse = (reason: string, argument: string): Output => ({
  lines: [text(`cd: ${reason}: ${argument}`, 'muted')],
  effects: [],
})

const arriveAt = (cwd: Cwd): Output => ({ lines: [], effects: [{ kind: 'changeDirectory', cwd }] })

export const cd: App = {
  name: 'cd',
  aliases: [],
  summary: 'change the working directory',
  listed: null,
  counted: false,
  handles: [],
  run: ({ args, cwd }, volume) => {
    const argument = args[0] ?? '~'
    const target = argument.toLowerCase()
    const resolution = resolve(target, cwd, volume)
    if (resolution.kind === 'found') {
      if (!resolution.entry.directory) return refuse('not a directory', argument)
      const arrival = reachable[resolution.entry.path]
      return arrival === undefined ? refuse('permission denied', argument) : arriveAt(arrival)
    }
    if (unreachable.includes(target)) return refuse('permission denied', argument)
    if (documentSuffix.test(target)) return refuse('not a directory', argument)
    return refuse('no such file or directory', argument)
  },
}

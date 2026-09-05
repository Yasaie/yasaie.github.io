import { resolve } from '@/fs/path/path'
import type { Volume, VolumeEntry } from '@/fs/volume/volume'
import type { App, Cwd, Output } from '@/kernel/contract/contract'
import { appHandling } from '@/kernel/registry/registry'
import type { Line } from '@/tty/line/line'
import { text } from '@/tty/line/line'

const complaint = (message: string): Output => ({
  lines: [text(`cat: ${message}`, 'muted')],
  effects: [],
})

const dump = (contents: string): readonly Line[] =>
  contents
    .replace(/\n$/, '')
    .split('\n')
    .map((line) => text(line, 'body'))

const completing = (typed: string, cwd: Cwd, volume: Volume): VolumeEntry | undefined => {
  const cut = typed.lastIndexOf('/')
  const prefix = typed.slice(cut + 1)
  if (prefix === '') return undefined
  const directory = resolve(cut === -1 ? '.' : typed.slice(0, cut + 1), cwd, volume)
  if (directory.kind === 'notFound' || !directory.entry.directory) return undefined
  const [only, ...ambiguous] = volume
    .list(directory.entry.path)
    .filter((entry) => entry.name.startsWith(prefix))
  return ambiguous.length === 0 ? only : undefined
}

const locate = (typed: string, cwd: Cwd, volume: Volume): VolumeEntry | undefined => {
  const resolution = resolve(typed, cwd, volume)
  return resolution.kind === 'found' ? resolution.entry : completing(typed, cwd, volume)
}

export const cat: App = {
  name: 'cat',
  aliases: ['less', 'more', 'head', 'tail'],
  summary: 'print a file to the terminal',
  listed: null,
  counted: false,
  handles: [],
  run: ({ name, args, cwd }, volume) => {
    const argument = args[0]
    if (argument === undefined)
      return { lines: [text(`${name}: which file?`, 'muted')], effects: [] }
    const entry = locate(argument.toLowerCase(), cwd, volume)
    if (entry === undefined) return complaint(`${argument}: no such file or directory`)
    if (entry.locked) return complaint(`${argument}: permission denied`)
    const renderer = appHandling(entry.path)
    if (renderer !== undefined) {
      return { lines: [], effects: [{ kind: 'delegate', name: renderer.name, args: [entry.path] }] }
    }
    if (entry.directory) return complaint(`${argument}: is a directory`)
    const contents = volume.read(entry.path)
    return contents === undefined
      ? complaint(`${argument}: binary file`)
      : { lines: dump(contents), effects: [] }
  },
}

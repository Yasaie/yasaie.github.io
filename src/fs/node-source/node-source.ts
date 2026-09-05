import type { Dirent } from 'node:fs'
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import type { DiskEntry, DiskSource } from '@/fs/source/source'
import { byPath } from '@/fs/source/source'

const machinePath = (root: string, absolute: string): string =>
  `/${relative(root, absolute).split(sep).join('/')}`

const entryOf = async (root: string, dirent: Dirent): Promise<DiskEntry> => {
  const absolute = join(dirent.parentPath, dirent.name)
  const path = machinePath(root, absolute)
  if (dirent.isDirectory()) return { kind: 'directory', path }
  return { kind: 'file', path, bytes: (await stat(absolute)).size }
}

export const nodeSource = (root: string): DiskSource =>
  Object.freeze({
    enumerate: async () => {
      const dirents = await readdir(root, { recursive: true, withFileTypes: true })
      const entries = await Promise.all(dirents.map((dirent) => entryOf(root, dirent)))
      return Object.freeze(entries.toSorted(byPath))
    },
    read: (path: string) => readFile(join(root, path), 'utf8'),
  })

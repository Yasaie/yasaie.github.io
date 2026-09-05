import type { Owner, Permissions } from '@/fs/inode/inode'
import { directoryBytes, inodeOf } from '@/fs/inode/inode'
import { parentOf } from '@/fs/path/path'
import type { DiskEntry, DiskSource } from '@/fs/source/source'
import { byPath } from '@/fs/source/source'

export type VolumeEntry = {
  readonly path: string
  readonly name: string
  readonly directory: boolean
  readonly bytes: number
  readonly permissions: Permissions
  readonly owner: Owner
  readonly year: string | null
  readonly locked: boolean
}

export type Volume = {
  readonly stat: (path: string) => VolumeEntry | undefined
  readonly exists: (path: string) => boolean
  readonly read: (path: string) => string | undefined
  readonly require: (path: string) => string
  readonly list: (path: string) => readonly VolumeEntry[]
}

const noEntries: readonly VolumeEntry[] = Object.freeze([])

const nameOf = (path: string): string => path.slice(path.lastIndexOf('/') + 1)

const entryOf = (disk: DiskEntry): VolumeEntry => {
  const directory = disk.kind === 'directory'
  const inode = inodeOf(disk.path, directory)
  return Object.freeze({
    path: disk.path,
    name: nameOf(disk.path),
    directory,
    bytes: directory ? directoryBytes : disk.bytes,
    permissions: inode.permissions,
    owner: inode.owner,
    year: inode.year,
    locked: inode.locked,
  })
}

const isLegible = (entry: VolumeEntry): boolean => !entry.directory && !entry.locked

const childrenOf = (entries: readonly VolumeEntry[]): ReadonlyMap<string, readonly VolumeEntry[]> =>
  new Map(
    [...Map.groupBy(entries, (entry) => parentOf(entry.path))].map(
      ([parent, group]) => [parent, Object.freeze(group)] as const,
    ),
  )

export const mount = async (source: DiskSource): Promise<Volume> => {
  const entries: readonly VolumeEntry[] = Object.freeze(
    (await source.enumerate()).map(entryOf).toSorted(byPath),
  )
  const read = await Promise.all(
    entries
      .filter(isLegible)
      .map(async (entry) => [entry.path, await source.read(entry.path)] as const),
  )
  const contents = new Map(read)
  const children = childrenOf(entries)
  const index = new Map(entries.map((entry) => [entry.path, entry] as const))
  return Object.freeze({
    stat: (path: string) => index.get(path),
    exists: (path: string) => index.has(path),
    read: (path: string) => contents.get(path),
    require: (path: string) => {
      const content = contents.get(path)
      if (content === undefined) throw new Error(`read: ${path}: no such file or directory`)
      return content
    },
    list: (path: string) => children.get(path) ?? noEntries,
  })
}

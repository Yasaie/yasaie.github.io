import * as z from 'zod/mini'
import type { DiskEntry, DiskSource } from '@/fs/disk-source/disk-source'
import { byPath, diskIndexPath } from '@/fs/disk-source/disk-source'

const indexRecord = z.discriminatedUnion('directory', [
  z.object({ path: z.string(), directory: z.literal(true) }),
  z.object({ path: z.string(), directory: z.literal(false), bytes: z.number() }),
])

const volumeIndex = z.array(indexRecord)

type IndexRecord = z.infer<typeof indexRecord>

const entryOf = (record: IndexRecord): DiskEntry =>
  record.directory
    ? { kind: 'directory', path: record.path }
    : { kind: 'file', path: record.path, bytes: record.bytes }

const parseIndex = (payload: unknown, from: string): readonly DiskEntry[] => {
  const read = z.safeParse(volumeIndex, payload)
  if (!read.success) throw new Error(`volume index at ${from} is not a list of disk entries`)
  return Object.freeze(read.data.map(entryOf).toSorted(byPath))
}

const fetchOrThrow = async (url: string): Promise<Response> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`cannot read ${url}: ${response.status} ${response.statusText}`)
  return response
}

export const browserSource = (): DiskSource =>
  Object.freeze({
    enumerate: async () =>
      parseIndex(await (await fetchOrThrow(diskIndexPath)).json(), diskIndexPath),
    read: async (path: string) => (await fetchOrThrow(path)).text(),
  })

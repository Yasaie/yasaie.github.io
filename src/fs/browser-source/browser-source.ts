import type { DiskEntry, DiskSource } from '@/fs/source/source'
import { byPath, diskIndexPath } from '@/fs/source/source'

type IndexRecord =
  | { readonly path: string; readonly directory: true }
  | { readonly path: string; readonly directory: false; readonly bytes: number }

const isRecord = (value: unknown): value is IndexRecord => {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  if (typeof candidate.path !== 'string') return false
  return (
    candidate.directory === true ||
    (candidate.directory === false && typeof candidate.bytes === 'number')
  )
}

const entryOf = (record: IndexRecord): DiskEntry =>
  record.directory
    ? { kind: 'directory', path: record.path }
    : { kind: 'file', path: record.path, bytes: record.bytes }

const parseIndex = (payload: unknown, from: string): readonly DiskEntry[] => {
  if (!Array.isArray(payload) || !payload.every(isRecord))
    throw new Error(`volume index at ${from} is not a list of disk entries`)
  return Object.freeze(payload.map(entryOf).toSorted(byPath))
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

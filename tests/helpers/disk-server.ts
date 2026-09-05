import { realDiskSource } from '#tests/helpers/disk'
import { diskIndexPath } from '@/fs/disk-source/disk-source'

const superblock = async (): Promise<string> =>
  JSON.stringify(
    (await realDiskSource().enumerate()).map((entry) =>
      entry.kind === 'directory'
        ? { path: entry.path, directory: true }
        : { path: entry.path, directory: false, bytes: entry.bytes },
    ),
  )

const missing = (): Response =>
  new Response('not found', { status: 404, statusText: 'File not found' })

export const serveRealDisk = async (): Promise<(url: string) => Promise<Response>> => {
  const index = await superblock()
  const disk = realDiskSource()
  return async (url: string) => {
    if (url === diskIndexPath) return new Response(index)
    return disk.read(url).then((body) => new Response(body), missing)
  }
}

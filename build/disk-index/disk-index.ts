import type { Dirent } from 'node:fs'
import { lstat, readdir } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import type { Plugin } from 'vite'

export type DiskIndexRecord =
  | { readonly path: string; readonly directory: true }
  | { readonly path: string; readonly directory: false; readonly bytes: number }

export type DiskIndexOptions = {
  readonly root: string
  readonly path?: string
}

export const defaultDiskIndexPath = '/.superblock.json'

const machinePath = (root: string, absolute: string): string =>
  `/${relative(root, absolute).split(sep).join('/')}`

const urlSafe = /^[A-Za-z0-9._/-]+$/

const recordOf = async (root: string, dirent: Dirent): Promise<DiskIndexRecord> => {
  const absolute = join(dirent.parentPath, dirent.name)
  const path = machinePath(root, absolute)
  if (!urlSafe.test(path)) throw new Error(`disk: ${path} is not addressable as a url`)
  if (dirent.isDirectory()) return { path, directory: true }
  if (!dirent.isFile()) throw new Error(`disk: ${path} is not a regular file or a directory`)
  return { path, directory: false, bytes: (await lstat(absolute)).size }
}

export const readDiskIndex = async (root: string): Promise<readonly DiskIndexRecord[]> => {
  const dirents = await readdir(root, { recursive: true, withFileTypes: true })
  const records = await Promise.all(dirents.map((dirent) => recordOf(root, dirent)))
  return records.toSorted((left, right) => left.path.localeCompare(right.path))
}

const publish = async (root: string): Promise<string> =>
  `${JSON.stringify(await readDiskIndex(root), null, 2)}\n`

export const diskIndex = ({ root, path = defaultDiskIndexPath }: DiskIndexOptions): Plugin => ({
  name: 'disk-index',
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const asked = new URL(request.url ?? '/', 'http://disk').pathname
      const reads =
        request.method === undefined || request.method === 'GET' || request.method === 'HEAD'
      if (asked !== path || !reads) return next()
      publish(root)
        .then((body) => {
          response.setHeader('content-type', 'application/json')
          response.end(body)
        })
        .catch(next)
    })
  },
  async generateBundle() {
    this.emitFile({ type: 'asset', fileName: path.slice(1), source: await publish(root) })
  },
})

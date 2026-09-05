import { readdirSync, statSync } from 'node:fs'
import { mkdtemp, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { DiskIndexRecord } from './disk-index.ts'
import { defaultDiskIndexPath, diskIndex, readDiskIndex } from './disk-index.ts'

const diskRoot = join(process.cwd(), 'disk')

const walkedByHand = (): readonly DiskIndexRecord[] =>
  readdirSync(diskRoot, { recursive: true, withFileTypes: true })
    .map((entry) => {
      const absolute = join(entry.parentPath, entry.name)
      const path = `/${relative(diskRoot, absolute).split(sep).join('/')}`
      return entry.isDirectory()
        ? { path, directory: true as const }
        : { path, directory: false as const, bytes: statSync(absolute).size }
    })
    .toSorted((left, right) => (left.path < right.path ? -1 : 1))

const emitted = async (root: string): Promise<string> => {
  const files: string[] = []
  const plugin = diskIndex({ root })
  const generate = plugin.generateBundle
  if (typeof generate !== 'function') throw new Error('the plugin publishes no bundle')
  await Reflect.apply(
    generate,
    { emitFile: (file: { source: string }) => files.push(file.source) },
    [],
  )
  return files.join('')
}

const served = async (
  url: string | undefined,
  root = diskRoot,
  method?: string,
): Promise<{
  readonly body: string
  readonly headers: readonly string[]
  readonly passedOn: boolean
}> =>
  new Promise((settle, fail) => {
    const headers: string[] = []
    const plugin = diskIndex({ root })
    const configure = plugin.configureServer
    if (typeof configure !== 'function') return fail(new Error('the plugin serves nothing'))
    const server = {
      middlewares: {
        use: (
          handler: (request: unknown, response: unknown, next: (error?: unknown) => void) => void,
        ) =>
          handler(
            { url, method },
            {
              setHeader: (name: string, value: string) => headers.push(`${name}: ${value}`),
              end: (body: string) => settle({ body, headers, passedOn: false }),
            },
            (error?: unknown) =>
              error === undefined
                ? settle({ body: '', headers, passedOn: true })
                : fail(error as Error),
          ),
      },
    }
    return Reflect.apply(configure, undefined, [server])
  })

describe('readDiskIndex', () => {
  it('publishes every entry on the real disk, so nothing is left unmountable', async () => {
    expect(await readDiskIndex(diskRoot)).toEqual(walkedByHand())
  })

  it('excludes no dotfile, because a machine lists its whole disk', async () => {
    const paths = (await readDiskIndex(diskRoot)).map((record) => record.path)
    expect(paths).toContain('/home/payam/eindhoven/.secrets')
  })

  it('records a file at the size the file really is', async () => {
    const records = await readDiskIndex(diskRoot)
    const whoami = '/home/payam/eindhoven/whoami.txt'
    expect(records.find((record) => record.path === whoami)).toEqual({
      path: whoami,
      directory: false,
      bytes: statSync(join(diskRoot, whoami)).size,
    })
  })

  it('records the sealed file at its real size without ever opening it', async () => {
    const secrets = '/home/payam/eindhoven/.secrets'
    const records = await readDiskIndex(diskRoot)
    expect(records.find((record) => record.path === secrets)).toEqual({
      path: secrets,
      directory: false,
      bytes: statSync(join(diskRoot, secrets)).size,
    })
  })

  it('marks a directory as one and gives it no size to invent', async () => {
    const records = await readDiskIndex(diskRoot)
    expect(records.find((record) => record.path === '/home/payam/eindhoven/work')).toEqual({
      path: '/home/payam/eindhoven/work',
      directory: true,
    })
  })

  it('publishes the entries in path order, so two builds agree byte for byte', async () => {
    const paths = (await readDiskIndex(diskRoot)).map((record) => record.path)
    expect(paths).toEqual(paths.toSorted())
  })
})

describe('defaultDiskIndexPath', () => {
  it('is the well-known path the running machine looks for its superblock at', () => {
    expect(defaultDiskIndexPath).toBe('/superblock.json')
  })
})

describe('the plugin, asked to do something other than read', () => {
  it('passes a write straight on, since the superblock is only ever published', async () => {
    expect((await served(defaultDiskIndexPath, diskRoot, 'POST')).passedOn).toBe(true)
  })
})

describe('readDiskIndex, given a disk it cannot describe', () => {
  it('names the entry it refuses rather than failing with a path from the build machine', async () => {
    const root = await mkdtemp(join(tmpdir(), 'disk-'))
    await symlink(join(root, 'nowhere'), join(root, 'dangling'))

    await expect(readDiskIndex(root)).rejects.toThrow('/dangling')
  })

  it('refuses a name the browser could not ask for, since every path is fetched as a url', async () => {
    const root = await mkdtemp(join(tmpdir(), 'disk-'))
    await writeFile(join(root, 'we ird#?.txt'), 'x')

    await expect(readDiskIndex(root)).rejects.toThrow('addressable as a url')
  })
})

describe('the plugin, building the site', () => {
  it('emits the index the browser mounts from', async () => {
    expect(JSON.parse(await emitted(diskRoot))).toEqual(await readDiskIndex(diskRoot))
  })

  it('emits the index at the path the running machine asks for', async () => {
    const files: string[] = []
    const generate = diskIndex({ root: diskRoot }).generateBundle
    if (typeof generate !== 'function') throw new Error('the plugin publishes no bundle')
    await Reflect.apply(
      generate,
      { emitFile: (file: { fileName: string }) => files.push(file.fileName) },
      [],
    )
    expect(files).toEqual(['superblock.json'])
  })

  it('emits the index wherever the build was told to publish it', async () => {
    const files: string[] = []
    const generate = diskIndex({ root: diskRoot, path: '/volume.json' }).generateBundle
    if (typeof generate !== 'function') throw new Error('the plugin publishes no bundle')
    await Reflect.apply(
      generate,
      { emitFile: (file: { fileName: string }) => files.push(file.fileName) },
      [],
    )
    expect(files).toEqual(['volume.json'])
  })
})

describe('the plugin, serving the site in development', () => {
  it('answers the index request with what the build would have emitted', async () => {
    const response = await served(defaultDiskIndexPath)
    expect(JSON.parse(response.body)).toEqual(await readDiskIndex(diskRoot))
  })

  it('answers with json, so the browser parses it as the superblock it is', async () => {
    expect((await served(defaultDiskIndexPath)).headers).toEqual(['content-type: application/json'])
  })

  it('answers the same however the browser cache-busts the request', async () => {
    expect((await served(`${defaultDiskIndexPath}?t=1`)).body).toBe(
      (await served(defaultDiskIndexPath)).body,
    )
  })

  it('leaves every other request to the rest of the server', async () => {
    expect((await served('/home/payam/eindhoven/whoami.txt')).passedOn).toBe(true)
  })

  it('leaves a request with no url at all to the rest of the server', async () => {
    expect((await served(undefined)).passedOn).toBe(true)
  })

  it('reports a disk it cannot walk rather than answering with a broken index', async () => {
    await expect(
      served(defaultDiskIndexPath, join(process.cwd(), 'no-such-disk')),
    ).rejects.toThrow()
  })
})

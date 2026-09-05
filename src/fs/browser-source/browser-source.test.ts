import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { browserSource } from '@/fs/browser-source/browser-source'
import type { DiskEntry } from '@/fs/source/source'
import { diskPaths, realBytes, realDiskSource, realText, serveRealDisk } from '@/testing/disk/disk'

const whoami = '/home/payam/eindhoven/whoami.txt'

const answering = (reply: (url: string) => Promise<Response>): void => {
  vi.stubGlobal('fetch', (url: string) => reply(url))
}

const serving = (body: unknown): void => {
  answering(async () => new Response(JSON.stringify(body)))
}

let served: (url: string) => Promise<Response>

beforeAll(async () => {
  served = await serveRealDisk()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('browserSource, reading the published volume index', () => {
  it('enumerates the whole disk the build published, dotfiles included', async () => {
    answering(served)
    expect((await browserSource().enumerate()).map((entry) => entry.path)).toEqual(diskPaths)
  })

  it('agrees with the node source entry for entry, so both mount the same machine', async () => {
    answering(served)
    expect(await browserSource().enumerate()).toEqual(await realDiskSource().enumerate())
  })

  it('carries the real byte size of a file it has never opened', async () => {
    answering(served)
    const entries = await browserSource().enumerate()
    expect(entries.find((entry) => entry.path === whoami)).toEqual({
      kind: 'file',
      path: whoami,
      bytes: realBytes(whoami),
    })
  })

  it('gives a directory no size, because HTTP cannot measure one', async () => {
    answering(served)
    const entries = await browserSource().enumerate()
    expect(entries.find((entry) => entry.path === '/home/payam/eindhoven/work')).toEqual({
      kind: 'directory',
      path: '/home/payam/eindhoven/work',
    })
  })

  it('orders the enumeration itself, so a shuffled index still mounts the same volume', async () => {
    serving([
      { path: '/b.txt', directory: false, bytes: 2 },
      { path: '/a', directory: true },
    ])
    const entries: readonly DiskEntry[] = await browserSource().enumerate()
    expect(entries.map((entry) => entry.path)).toEqual(['/a', '/b.txt'])
  })
})

describe('browserSource, reading a document', () => {
  it('returns the file exactly as it is served', async () => {
    answering(served)
    expect(await browserSource().read(whoami)).toBe(realText(whoami))
  })
})

describe('browserSource, when the machine cannot find its disk', () => {
  it('names the index and the status it got back, so the failure can be shown', async () => {
    answering(async () => new Response('', { status: 404, statusText: 'File not found' }))
    await expect(browserSource().enumerate()).rejects.toThrow(
      'cannot read /.superblock.json: 404 File not found',
    )
  })

  it('names the document it could not read', async () => {
    answering(async () => new Response('', { status: 403, statusText: 'Forbidden' }))
    await expect(browserSource().read(whoami)).rejects.toThrow(
      `cannot read ${whoami}: 403 Forbidden`,
    )
  })

  it('refuses an index that is not a list at all', async () => {
    serving({ path: '/a', directory: true })
    await expect(browserSource().enumerate()).rejects.toThrow(
      'volume index at /.superblock.json is not a list of disk entries',
    )
  })

  it('refuses an index whose entries are not disk entries', async () => {
    serving(['/a', '/b'])
    await expect(browserSource().enumerate()).rejects.toThrow('is not a list of disk entries')
  })

  it('refuses an index entry with no path', async () => {
    serving([{ directory: true }])
    await expect(browserSource().enumerate()).rejects.toThrow('is not a list of disk entries')
  })

  it('refuses a file entry that states no size, rather than inventing one', async () => {
    serving([{ path: '/a.txt', directory: false }])
    await expect(browserSource().enumerate()).rejects.toThrow('is not a list of disk entries')
  })

  it('refuses an entry that says nothing about being a directory', async () => {
    serving([{ path: '/a.txt' }])
    await expect(browserSource().enumerate()).rejects.toThrow('is not a list of disk entries')
  })
})

import { beforeAll, describe, expect, it } from 'vitest'
import type { DiskSource } from '@/fs/source/source'
import type { Volume } from '@/fs/volume/volume'
import { mount } from '@/fs/volume/volume'
import { diskFiles, realBytes, realDiskSource, realText } from '@/test/disk/disk'

const home = '/home/payam/eindhoven'
const work = `${home}/work`
const secrets = `${home}/.secrets`

const watching = (
  source: DiskSource,
): { readonly opened: readonly string[]; readonly source: DiskSource } => {
  const opened: string[] = []
  return {
    opened,
    source: {
      enumerate: source.enumerate,
      read: (path: string) => {
        opened.push(path)
        return source.read(path)
      },
    },
  }
}

let volume: Volume

beforeAll(async () => {
  volume = await mount(realDiskSource())
})

describe('a mounted volume', () => {
  it('carries every document the disk holds', () => {
    expect(diskFiles.filter((path) => volume.exists(path))).toEqual(diskFiles)
  })

  it('hands back a document byte for byte, so no app ever reshapes a file', () => {
    expect(volume.read(`${home}/whoami.txt`)).toBe(realText(`${home}/whoami.txt`))
  })

  it('reports a file at the size the file really is', () => {
    expect(volume.stat(`${home}/whoami.txt`)?.bytes).toBe(realBytes(`${home}/whoami.txt`))
  })

  it('reports every file at its real size, so no size is ever written by hand', () => {
    const sized = diskFiles.map((path) => [path, volume.stat(path)?.bytes])
    expect(sized).toEqual(diskFiles.map((path) => [path, realBytes(path)]))
  })

  it('gives a directory the one size the disk cannot measure for it', () => {
    expect(volume.stat(work)).toMatchObject({ directory: true, bytes: 4096 })
  })

  it('names each entry by its last path segment', () => {
    expect(volume.stat(`${work}/6-freelance.md`)?.name).toBe('6-freelance.md')
  })

  it('stamps an entry with the facts the disk cannot carry', () => {
    expect(volume.stat(`${home}/stack.txt`)).toMatchObject({
      permissions: '-rw-r--r--',
      owner: { user: 'payam', group: 'yasaie' },
      year: '2026',
      locked: false,
    })
  })

  it('leaves a chapter undated, because the chapter states its own year', () => {
    expect(volume.stat(`${work}/1-goodhabitz.md`)?.year).toBeNull()
  })

  it('answers nothing rather than throwing when asked about a path that is not there', () => {
    expect(volume.stat(`${home}/nowhere.txt`)).toBeUndefined()
    expect(volume.exists(`${home}/nowhere.txt`)).toBe(false)
    expect(volume.read(`${home}/nowhere.txt`)).toBeUndefined()
  })

  it('cannot be swapped out from under the apps that read it', () => {
    expect(Object.isFrozen(volume)).toBe(true)
  })

  it('hands back an entry nothing downstream can rewrite', () => {
    expect(Object.isFrozen(volume.stat(work))).toBe(true)
  })
})

describe('a mounted volume, listing a directory', () => {
  it('lists the immediate children of a directory in path order', () => {
    expect(volume.list(home).map((entry) => entry.name)).toEqual([
      '.secrets',
      'contact.txt',
      'stack.txt',
      'whoami.txt',
      'work',
    ])
  })

  it('lists a nested directory without repeating what its parent holds', () => {
    expect(volume.list(work).map((entry) => entry.name)).toEqual([
      '1-goodhabitz.md',
      '2-owow-agency.md',
      '3-tas-hil-gostar.md',
      '4-tahlilgaran.md',
      '5-tabesh-rayan-energy.md',
      '6-freelance.md',
    ])
  })

  it('lists nothing for a file, so a caller need not check first', () => {
    expect(volume.list(`${home}/whoami.txt`)).toEqual([])
  })

  it('lists nothing for a path the disk never had', () => {
    expect(volume.list('/var/log')).toEqual([])
  })

  it('hands back a listing nothing downstream can reorder', () => {
    expect(Object.isFrozen(volume.list(home))).toBe(true)
  })
})

describe('a mounted volume, and the file it refuses to open', () => {
  it('knows exactly how big the sealed file is', () => {
    expect(volume.stat(secrets)).toMatchObject({
      bytes: realBytes(secrets),
      permissions: '-r--------',
      locked: true,
    })
  })

  it('still answers nothing when asked for the sealed file, having never opened it', async () => {
    const watched = watching(realDiskSource())
    const mounted = await mount(watched.source)
    expect(watched.opened).not.toContain(secrets)
    expect(mounted.read(secrets)).toBeUndefined()
  })

  it('opens every other file on the disk exactly once while mounting', async () => {
    const watched = watching(realDiskSource())
    await mount(watched.source)
    expect(watched.opened.toSorted()).toEqual(diskFiles.filter((path) => path !== secrets))
  })
})

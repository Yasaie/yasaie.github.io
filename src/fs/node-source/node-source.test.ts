import { describe, expect, it } from 'vitest'
import {
  diskDirectories,
  diskFiles,
  diskPaths,
  diskRoot,
  realBytes,
  realText,
} from '#tests/helpers/disk'
import { nodeSource } from '@/fs/node-source/node-source'

const source = nodeSource(diskRoot)

describe('nodeSource', () => {
  it('enumerates every entry on the real disk, dotfiles included, in path order', async () => {
    expect((await source.enumerate()).map((entry) => entry.path)).toEqual(diskPaths)
  })

  it('reports each file at the size the file really is', async () => {
    const entries = await source.enumerate()
    expect(entries.filter((entry) => entry.kind === 'file')).toEqual(
      diskFiles.toSorted().map((path) => ({ kind: 'file', path, bytes: realBytes(path) })),
    )
  })

  it('enumerates a directory without inventing a size for it', async () => {
    const entries = await source.enumerate()
    expect(entries.filter((entry) => entry.kind === 'directory')).toEqual(
      diskDirectories.toSorted().map((path) => ({ kind: 'directory', path })),
    )
  })

  it('reads a document back byte for byte', async () => {
    expect(await source.read('/home/payam/eindhoven/whoami.txt')).toBe(
      realText('/home/payam/eindhoven/whoami.txt'),
    )
  })

  it('reads a dotfile as readily as any other file, whatever a host would serve', async () => {
    expect(await source.read('/home/payam/eindhoven/.secrets')).toHaveLength(
      realBytes('/home/payam/eindhoven/.secrets'),
    )
  })
})

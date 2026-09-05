import { describe, expect, it } from 'vitest'
import type { DiskEntry } from '@/fs/disk-source/disk-source'
import { byPath, diskIndexPath } from '@/fs/disk-source/disk-source'

const secrets: DiskEntry = { kind: 'file', path: '/home/payam/eindhoven/.secrets', bytes: 1 }
const work: DiskEntry = { kind: 'directory', path: '/home/payam/eindhoven/work' }
const whoami: DiskEntry = { kind: 'file', path: '/home/payam/eindhoven/whoami.txt', bytes: 1 }

describe('byPath', () => {
  it('orders a listing by path, so two machines enumerate the disk alike', () => {
    expect([work, whoami, secrets].toSorted(byPath)).toEqual([secrets, whoami, work])
  })

  it('treats one path as equal to itself, so sorting is stable', () => {
    expect(byPath(whoami, whoami)).toBe(0)
  })

  it('orders a path before a longer path that starts with it', () => {
    const chapter: DiskEntry = { kind: 'file', path: `${work.path}/1-goodhabitz.md`, bytes: 1 }
    expect(byPath(work, chapter)).toBe(-1)
  })

  it('orders anything that carries a path, so one comparator serves the whole machine', () => {
    expect(byPath({ path: '/a' }, { path: '/b' })).toBe(-1)
  })
})

describe('diskIndexPath', () => {
  it('is the well-known path the build publishes the volume index at', () => {
    expect(diskIndexPath).toBe('/.superblock.json')
  })
})

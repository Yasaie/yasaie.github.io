import { describe, expect, it } from 'vitest'
import { directoryBytes, inodeOf, syntheticEntriesFor } from '@/fs/inode/inode'
import { homePath, parentOfHomePath, workPath } from '@/fs/path/path'

const payam = { user: 'payam', group: 'yasaie' }

describe('inodeOf, the entries the specification assigns facts to', () => {
  it('dates the home directory to the year the story starts', () => {
    expect(inodeOf(homePath, true)).toEqual({
      permissions: 'drwxr-xr-x',
      owner: payam,
      year: '2010',
      locked: false,
    })
  })

  it('seals the directory above home behind root, so nothing can walk out of it', () => {
    expect(inodeOf(parentOfHomePath, true)).toEqual({
      permissions: 'd---------',
      owner: { user: 'root', group: 'root' },
      year: '1993',
      locked: true,
    })
  })

  it('dates the work directory to the current chapter', () => {
    expect(inodeOf(workPath, true)).toEqual({
      permissions: 'drwxr-xr-x',
      owner: payam,
      year: '2024',
      locked: false,
    })
  })

  it('dates whoami.txt to 2010 and stack and contact to 2026', () => {
    expect(
      [`${homePath}/whoami.txt`, `${homePath}/stack.txt`, `${homePath}/contact.txt`].map(
        (path) => inodeOf(path, false).year,
      ),
    ).toEqual(['2010', '2026', '2026'])
  })

  it('gives every readable document the ordinary file permissions', () => {
    expect(inodeOf(`${homePath}/whoami.txt`, false)).toEqual({
      permissions: '-rw-r--r--',
      owner: payam,
      year: '2010',
      locked: false,
    })
  })

  it('locks .secrets read-only to its owner, which is why it is never opened', () => {
    expect(inodeOf(`${homePath}/.secrets`, false)).toEqual({
      permissions: '-r--------',
      owner: payam,
      year: '2010',
      locked: true,
    })
  })
})

describe('inodeOf, the entries the specification says nothing about', () => {
  it('leaves an undeclared file readable, unlocked and undated', () => {
    expect(inodeOf('/etc/yasaie-release', false)).toEqual({
      permissions: '-rw-r--r--',
      owner: payam,
      year: null,
      locked: false,
    })
  })

  it('leaves an undeclared directory traversable, unlocked and undated', () => {
    expect(inodeOf('/etc', true)).toEqual({
      permissions: 'drwxr-xr-x',
      owner: payam,
      year: null,
      locked: false,
    })
  })

  it('declares no year for a work chapter, because the chapter states its own', () => {
    expect(inodeOf(`${workPath}/3-tas-hil-gostar.md`, false).year).toBeNull()
  })
})

describe('directoryBytes', () => {
  it('is the size a directory reports, since no directory can be measured over HTTP', () => {
    expect(directoryBytes).toBe(4096)
  })
})

describe('syntheticEntriesFor', () => {
  it('points the two entries no disk carries at the directory being listed and its parent', () => {
    expect(syntheticEntriesFor(homePath)).toEqual([
      { name: '.', path: homePath },
      { name: '..', path: parentOfHomePath },
    ])
  })

  it('follows whichever directory is being listed, so work sees work and home above it', () => {
    expect(syntheticEntriesFor(workPath)).toEqual([
      { name: '.', path: workPath },
      { name: '..', path: homePath },
    ])
  })

  it('cannot be rewritten by whoever lists a directory', () => {
    expect(Object.isFrozen(syntheticEntriesFor(homePath))).toBe(true)
  })
})

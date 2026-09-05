import { beforeAll, describe, expect, it } from 'vitest'
import { homePath, parentOf, parentOfHomePath, pathOf, resolve, workPath } from '@/fs/path/path'
import type { Volume } from '@/fs/volume/volume'
import { mountRealDisk } from '@/testing/disk/disk'

let volume: Volume

beforeAll(async () => {
  volume = await mountRealDisk()
})

const found = (typed: string, cwd: '~' | '~/work' = '~'): string | undefined => {
  const resolution = resolve(typed, cwd, volume)
  return resolution.kind === 'found' ? resolution.entry.path : undefined
}

describe('pathOf', () => {
  it('spells the home prompt as the absolute path pwd prints', () => {
    expect(pathOf('~')).toBe('/home/payam/eindhoven')
  })

  it('spells the work prompt as the absolute path pwd prints', () => {
    expect(pathOf('~/work')).toBe('/home/payam/eindhoven/work')
  })

  it('names the sealed directory above home', () => {
    expect(parentOfHomePath).toBe('/home/payam')
  })

  it('keeps home and work on the same branch of the disk', () => {
    expect(workPath).toBe(`${homePath}/work`)
  })
})

describe('parentOf', () => {
  it('climbs one directory, which is what .. means wherever it is typed', () => {
    expect(parentOf(workPath)).toBe(homePath)
    expect(parentOf(homePath)).toBe(parentOfHomePath)
  })

  it('stops at the root rather than walking off the disk', () => {
    expect(parentOf('/home')).toBe('')
  })
})

describe('resolve, from home', () => {
  it('completes a bare command-shaped name to the text file that carries it', () => {
    expect(found('whoami')).toBe(`${homePath}/whoami.txt`)
  })

  it('accepts the file name spelled in full', () => {
    expect(found('whoami.txt')).toBe(`${homePath}/whoami.txt`)
  })

  it('accepts a name prefixed with the current directory', () => {
    expect(found('./whoami')).toBe(`${homePath}/whoami.txt`)
  })

  it('accepts a name anchored at home with a tilde', () => {
    expect(found('~/whoami.txt')).toBe(`${homePath}/whoami.txt`)
  })

  it('accepts an absolute path on the machine', () => {
    expect(found('/home/payam/eindhoven/stack.txt')).toBe(`${homePath}/stack.txt`)
  })

  it('resolves a directory as readily as a file', () => {
    expect(found('work')).toBe(workPath)
  })

  it('ignores a trailing slash on a directory', () => {
    expect(found('work/')).toBe(workPath)
  })

  it('descends into a subdirectory', () => {
    expect(found('work/3-tas-hil-gostar.md')).toBe(`${workPath}/3-tas-hil-gostar.md`)
  })

  it('resolves the current directory itself', () => {
    expect(found('.')).toBe(homePath)
  })

  it('resolves the parent, which exists on the disk even though it is sealed', () => {
    expect(found('..')).toBe(parentOfHomePath)
  })

  it('resolves a dotfile that is enumerated but never opened', () => {
    expect(found('.secrets')).toBe(`${homePath}/.secrets`)
  })
})

describe('resolve, from work', () => {
  it('finds a chapter by its file name', () => {
    expect(found('3-tas-hil-gostar.md', '~/work')).toBe(`${workPath}/3-tas-hil-gostar.md`)
  })

  it('completes a chapter name to the markdown file that holds it', () => {
    expect(found('3-tas-hil-gostar', '~/work')).toBe(`${workPath}/3-tas-hil-gostar.md`)
  })

  it('climbs out to a document in home and completes its extension', () => {
    expect(found('../whoami', '~/work')).toBe(`${homePath}/whoami.txt`)
  })

  it('climbs out to another document in home', () => {
    expect(found('../stack', '~/work')).toBe(`${homePath}/stack.txt`)
  })

  it('resolves the parent as home', () => {
    expect(found('..', '~/work')).toBe(homePath)
  })

  it('resolves the current directory as work', () => {
    expect(found('.', '~/work')).toBe(workPath)
  })
})

describe('resolve, when nothing is there', () => {
  it('reports the target exactly as it was typed, so the message can quote it', () => {
    expect(resolve('nope', '~', volume)).toEqual({ kind: 'notFound', target: 'nope' })
  })

  it('refuses a chapter number, because a shorthand is not a path', () => {
    expect(resolve('work/3', '~', volume).kind).toBe('notFound')
  })

  it('refuses the machine root, which is not part of the volume', () => {
    expect(resolve('/', '~', volume).kind).toBe('notFound')
  })

  it('stops climbing at the top instead of walking off the disk', () => {
    expect(resolve('../../../..', '~', volume).kind).toBe('notFound')
  })
})

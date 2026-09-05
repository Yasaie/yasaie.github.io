import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { diskPaths } from '#tests/helpers/disk'
import { diskIndexPath } from '@/fs/disk-source/disk-source'
import { wideBreakpointPx } from '@/hooks/use-narrow-layout/use-narrow-layout'

const declaredIn = (file: string, pattern: RegExp): string | undefined =>
  pattern.exec(readFileSync(file, 'utf8'))?.[1]

describe('a value the running machine and its build both have to know', () => {
  it('names the superblock at one path, so the site cannot ship an index nothing fetches', () => {
    expect(diskIndexPath).toBe(
      declaredIn('build/disk-index/disk-index.ts', /defaultDiskIndexPath = '([^']+)'/),
    )
  })

  it('asks for the superblock at a path a static host will serve, which no dotfile is', () => {
    expect(diskIndexPath.startsWith('/.')).toBe(false)
  })

  it('asks for it at a path the disk does not already carry, so neither can hide the other', () => {
    expect(diskPaths).not.toContain(diskIndexPath)
  })
})

describe('a value written once in css and once in typescript', () => {
  it('switches the stacked reading in at the width the stylesheet stacks it at', () => {
    expect(String(wideBreakpointPx)).toBe(
      declaredIn('src/styles/index.css', /--breakpoint-wide:\s*(\d+)px/),
    )
  })
})

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { isTestPath, type SourceFile, sourceFilesIn } from '#tests/helpers/tree'

const layers = [
  'src/kernel',
  'src/fs',
  'src/tty',
  'src/lib',
  'src/session',
  'src/hooks',
  'src/ui',
] as const

const runtimeExport = /^export\s+(?!type\s|interface\s)/m

const buildConfig = readFileSync('vite.config.ts', 'utf8')

const everyFile: readonly SourceFile[] = layers.flatMap(sourceFilesIn)

const modules = everyFile.filter((file) => !isTestPath(file.path))

const present = new Set(everyFile.map((file) => file.path))

const hasTest = (path: string): boolean =>
  present.has(path.replace(/\.tsx?$/, '.test.ts')) ||
  present.has(path.replace(/\.tsx?$/, '.test.tsx'))

const folderOf = (path: string): string => path.split('/').at(-2) ?? ''

describe('every layer of the machine', () => {
  it('is made of modules, so the convention is not passing on an empty tree', () => {
    expect(modules.length).toBeGreaterThan(0)
  })

  it('keeps each module alone in a folder named after it', () => {
    const misnamed = modules.filter(
      (file) => !new RegExp(`/${folderOf(file.path)}\\.tsx?$`).test(file.path),
    )
    expect(misnamed.map((file) => file.path)).toEqual([])
  })

  it('keeps a test beside every module that does something at runtime', () => {
    const untested = modules
      .filter((file) => runtimeExport.test(file.text))
      .filter((file) => !hasTest(file.path))
    expect(untested.map((file) => file.path)).toEqual([])
  })

  it('keeps a module that only declares types out of the coverage figure, since types cannot run', () => {
    const measured = modules
      .filter((file) => !runtimeExport.test(file.text))
      .filter((file) => !buildConfig.includes(file.path))

    expect(measured.map((file) => file.path)).toEqual([])
  })
})

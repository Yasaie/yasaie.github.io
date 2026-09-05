import { describe, expect, it } from 'vitest'
import { isTestPath, sourceFilesIn } from '@/test/tree/tree'

const specifier = /(?:from|import)\s*\(?\s*'([^']+)'/g

const appFiles = sourceFilesIn('src/apps')

const importsIn = (text: string): readonly string[] =>
  [...text.matchAll(specifier)].map((found) => found[1] ?? '')

const ownerOf = (path: string): string => path.split('/')[2] ?? ''

const foreignAppIn = (from: string, imported: string): string | undefined => {
  const owner = ownerOf(from)
  const aliased = /^@\/apps\/([^/]+)/.exec(imported)
  if (aliased !== null) return aliased[1] === owner ? undefined : aliased[1]
  return /^\.\.\/([^/]+)\//.exec(imported)?.[1]
}

const trespasses = appFiles.flatMap((file) =>
  importsIn(file.text)
    .map((imported) => foreignAppIn(file.path, imported))
    .filter((name) => name !== undefined)
    .map((name) => `${file.path} reaches into ${name}`),
)

const layersReached = appFiles
  .filter((file) => !isTestPath(file.path))
  .flatMap((file) =>
    importsIn(file.text)
      .filter((imported) => imported.startsWith('@/'))
      .map((imported) => imported.split('/')[1] ?? ''),
  )

describe('every app', () => {
  it('has files to check, so the convention is not passing on an empty tree', () => {
    expect(appFiles.length).toBeGreaterThan(0)
  })

  it('knows nothing about any other app, so one can be deleted without touching another', () => {
    expect(trespasses).toEqual([])
  })

  it('is built only on the layers beneath it, never on the session or the screen', () => {
    expect([...new Set(layersReached)].toSorted()).toEqual(['fs', 'kernel', 'tty'])
  })
})

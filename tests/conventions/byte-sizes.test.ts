import { describe, expect, it } from 'vitest'
import { diskFiles, realBytes } from '#tests/helpers/disk'
import { isTestPath, sourceFilesIn } from '#tests/helpers/tree'

const measured = [...new Set(diskFiles.map(realBytes))].filter((size) => size > 0).toSorted()

const application = sourceFilesIn('src').filter((file) => !isTestPath(file.path))

const literal = (size: number): RegExp => new RegExp(`(?<![\\w.])${size}(?![\\w.])`)

const handWritten = application.flatMap((file) =>
  measured.filter((size) => literal(size).test(file.text)).map((size) => `${file.path}: ${size}`),
)

describe('the sizes the machine reports', () => {
  it('has real files to measure, so the convention is not passing on an empty disk', () => {
    expect(measured.length).toBeGreaterThan(0)
  })

  it('appears nowhere in the source, because every size is read from the file itself', () => {
    expect(handWritten).toEqual([])
  })

  it('would be caught wherever one was typed out', () => {
    expect(literal(2040832).test('const secrets = 2040832')).toBe(true)
    expect(literal(399).test('const bytes = 1399')).toBe(false)
    expect(literal(399).test('const bytes = 399.5')).toBe(false)
  })
})

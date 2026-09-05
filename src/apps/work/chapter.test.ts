import { describe, expect, it } from 'vitest'
import { parseChapter } from './chapter'

const goodhabitz = [
  '# GoodHabitz',
  '',
  '2025 – now · senior software engineer · Eindhoven',
  '',
  '- learning platform used by millions of learners across Europe.',
  '- full stack, mostly TypeScript.',
].join('\n')

describe('a chapter of the work history', () => {
  it('reads the company from the heading and the credits from the line beneath it', () => {
    const chapter = parseChapter(1, '/work/1-goodhabitz.md', goodhabitz)

    expect(chapter.company).toBe('GoodHabitz')
    expect(chapter.years).toBe('2025 – now')
    expect(chapter.role).toBe('senior software engineer')
    expect(chapter.place).toBe('Eindhoven')
  })

  it('keeps the bullets in the order the file lists them, without their markers', () => {
    expect(parseChapter(1, '/work/1-goodhabitz.md', goodhabitz).bullets).toEqual([
      'learning platform used by millions of learners across Europe.',
      'full stack, mostly TypeScript.',
    ])
  })

  it('carries the index and path it was found at, so a listing can point back at the file', () => {
    const chapter = parseChapter(3, '/work/3-somewhere.md', goodhabitz)

    expect(chapter.index).toBe(3)
    expect(chapter.path).toBe('/work/3-somewhere.md')
  })

  it("cannot be edited after parsing, so one reader never changes another reader's copy", () => {
    expect(Object.isFrozen(parseChapter(1, '/work/1-goodhabitz.md', goodhabitz))).toBe(true)
  })
})

describe('a chapter file that has lost part of its shape', () => {
  it('still yields a chapter rather than failing the whole listing', () => {
    const chapter = parseChapter(1, '/work/1-somewhere.md', '# Somewhere')

    expect(chapter.company).toBe('Somewhere')
    expect(chapter.years).toBe('')
    expect(chapter.place).toBe('')
    expect(chapter.bullets).toEqual([])
  })

  it('reads a credits line with nothing after the years as having no role or place', () => {
    const chapter = parseChapter(2, '/work/2-somewhere.md', '# Somewhere\n\n2025 – now')

    expect(chapter.years).toBe('2025 – now')
    expect(chapter.role).toBe('')
    expect(chapter.place).toBe('')
  })
})

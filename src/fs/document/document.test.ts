import { describe, expect, it } from 'vitest'
import { realText } from '#tests/helpers/disk'
import { columnPairs, documentBlocks, documentLines } from '@/fs/document/document'

const home = '/home/payam/eindhoven'

describe('documentLines', () => {
  it('reads the banner as its rows, keeping the trailing spaces that draw the glyphs', () => {
    const issue = realText('/etc/issue')
    expect(documentLines(issue)).toEqual(issue.slice(0, -1).split('\n'))
  })

  it('drops the newline every well-formed file ends with, and no more', () => {
    expect(documentLines('a\n\n')).toEqual(['a', ''])
  })

  it('reads a file with no trailing newline as readily as one with', () => {
    expect(documentLines('a\nb')).toEqual(['a', 'b'])
  })

  it('reads an empty file as a single empty row rather than nothing', () => {
    expect(documentLines('')).toEqual([''])
  })

  it('hands back rows nothing downstream can rewrite', () => {
    expect(Object.isFrozen(documentLines('a\n'))).toBe(true)
  })
})

describe('documentBlocks', () => {
  it('splits the prose into the three blank-line-separated blocks whoami reads', () => {
    expect(documentBlocks(realText(`${home}/whoami.txt`)).map((block) => block.length)).toEqual([
      3, 2, 2,
    ])
  })

  it('gives the first block the name, the headline and the opening paragraph', () => {
    const [first = []] = documentBlocks(realText(`${home}/whoami.txt`))
    expect(first[0]).toBe('Payam Yasaie')
    expect(first[1]).toBe('senior software engineer · GoodHabitz · Eindhoven, NL')
  })

  it('reads a document as the blocks its blank lines divide it into', () => {
    expect(
      documentBlocks('# Somewhere\n\n2025 – now · a role · a place\n\n- one.\n- two.'),
    ).toEqual([['# Somewhere'], ['2025 – now · a role · a place'], ['- one.', '- two.']])
  })

  it('treats a line of whitespace as the break it looks like on screen', () => {
    expect(documentBlocks('a\n \nb')).toEqual([['a'], ['b']])
  })

  it('drops a run of blank lines instead of yielding an empty block', () => {
    expect(documentBlocks('a\n\n\n\nb')).toEqual([['a'], ['b']])
  })

  it('finds no blocks in a file that says nothing', () => {
    expect(documentBlocks('')).toEqual([])
  })

  it('hands back blocks nothing downstream can rewrite', () => {
    const blocks = documentBlocks('a\n\nb')
    expect(Object.isFrozen(blocks)).toBe(true)
    expect(Object.isFrozen(blocks[0])).toBe(true)
  })
})

describe('columnPairs', () => {
  it('reads an aligned file as the keys and values it lines up', () => {
    expect(columnPairs('languages  typescript · php\nfrontend   react · vue')).toEqual([
      { key: 'languages', value: 'typescript · php' },
      { key: 'frontend', value: 'react · vue' },
    ])
  })

  it('keeps a value whole however much space the file used to align it', () => {
    expect(columnPairs(realText(`${home}/contact.txt`))[0]).toEqual({
      key: 'mail',
      value: 'payam@yasaie.com',
    })
  })

  it('keeps the single spaces inside a value, splitting only on the gutter', () => {
    expect(columnPairs('where     eindhoven, nl')).toEqual([
      { key: 'where', value: 'eindhoven, nl' },
    ])
  })

  it('ignores a line that carries no gutter, so prose cannot become a pair', () => {
    expect(columnPairs('languages  ts\njust prose\nfrontend  react')).toEqual([
      { key: 'languages', value: 'ts' },
      { key: 'frontend', value: 'react' },
    ])
  })

  it('hands back pairs nothing downstream can rewrite', () => {
    const pairs = columnPairs('a  b')
    expect(Object.isFrozen(pairs)).toBe(true)
    expect(Object.isFrozen(pairs[0])).toBe(true)
  })
})

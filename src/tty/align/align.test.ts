import { describe, expect, it } from 'vitest'
import { screenLinks, screenText } from '@/testing/screen/screen'
import { keyValueBlock, padLeft, padRight, widestLength } from '@/tty/align/align'

const bootPairs = [
  { key: 'name', value: 'Payam Yasaie', valueColour: 'text' },
  { key: 'role', value: 'senior software engineer' },
  { key: 'uptime', value: '16 years' },
] as const

const bootColours = { key: 'muted', value: 'body' } as const

describe('widestLength', () => {
  it('measures the longest value so a column can be sized to it', () => {
    expect(widestLength(['name', 'role', 'uptime', 'langs'])).toBe(6)
  })

  it('measures nothing as zero, so an empty block still lays out', () => {
    expect(widestLength([])).toBe(0)
  })
})

describe('padRight', () => {
  it('fills a value out to the column width', () => {
    expect(padRight('name', 8)).toBe('name    ')
  })

  it('leaves a value that already fills the column alone', () => {
    expect(padRight('drwxr-xr-x', 4)).toBe('drwxr-xr-x')
  })
})

describe('padLeft', () => {
  it('pushes a value to the right of its column, which is how sizes line up', () => {
    expect(padLeft('399', 7)).toBe('    399')
  })

  it('leaves a value that already fills the column alone', () => {
    expect(padLeft('2040832', 3)).toBe('2040832')
  })
})

describe('keyValueBlock', () => {
  it('pads the key column to the longest key plus two on a wide screen', () => {
    const [first] = keyValueBlock(bootPairs, bootColours)
    expect(first).toMatchObject({
      kind: 'responsive',
      wide: {
        segments: [
          { text: 'name    ', colour: 'muted' },
          { text: 'Payam Yasaie', colour: 'text' },
        ],
        indent: '0',
      },
    })
  })

  it('gives every row of a block the same key column, whatever its own key', () => {
    const block = keyValueBlock(bootPairs, bootColours)
    expect(
      block.map((line) => (line.kind === 'responsive' ? line.wide.segments[0]?.text : '')),
    ).toEqual(['name    ', 'role    ', 'uptime  '])
  })

  it('stacks the value under its key indented two characters on a narrow screen', () => {
    const [first] = keyValueBlock(bootPairs, bootColours)
    expect(first).toMatchObject({
      kind: 'responsive',
      narrow: [
        { segments: [{ text: 'name', colour: 'muted' }], indent: '0' },
        { segments: [{ text: 'Payam Yasaie', colour: 'text' }], indent: '2ch' },
      ],
    })
  })

  it('paints a row in the block colours when it asks for no override', () => {
    const block = keyValueBlock(bootPairs, bootColours)
    expect(block[1]).toMatchObject({
      wide: {
        segments: [
          { text: 'role    ', colour: 'muted' },
          { text: 'senior software engineer', colour: 'body' },
        ],
      },
      narrow: [
        { segments: [{ text: 'role', colour: 'muted' }] },
        { segments: [{ text: 'senior software engineer', colour: 'body' }] },
      ],
    })
  })

  it('lays out a block of one key without borrowing a width from anywhere', () => {
    expect(keyValueBlock([{ key: 'shell', value: 'zsh' }], bootColours)).toMatchObject([
      { wide: { segments: [{ text: 'shell  ' }, { text: 'zsh' }] } },
    ])
  })

  it('lets a value point somewhere, on either reading of the same row', () => {
    const block = keyValueBlock(
      [{ key: 'github', value: 'github.com/yasaie', href: 'https://github.com/yasaie' }],
      bootColours,
    )
    expect(screenLinks(block)).toEqual([['github.com/yasaie', 'https://github.com/yasaie']])
    expect(screenLinks(block, 'narrow')).toEqual([
      ['github.com/yasaie', 'https://github.com/yasaie'],
    ])
    expect(screenText(block, 'narrow')).toEqual(['github', 'github.com/yasaie'])
  })

  it('produces no lines at all when there is nothing to lay out', () => {
    expect(keyValueBlock([], bootColours)).toEqual([])
  })
})

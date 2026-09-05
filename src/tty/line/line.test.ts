import { describe, expect, it } from 'vitest'
import { blank, plain, responsive, row, segment, text, wordmark } from '@/tty/line/line'

describe('segment', () => {
  it('pairs a run of text with the colour it is painted in', () => {
    expect(segment('payam@yasaie', 'accent')).toEqual({ text: 'payam@yasaie', colour: 'accent' })
  })
})

describe('row', () => {
  it('sits flush against the left edge unless the caller asks for an indent', () => {
    expect(row([segment('total 5', 'muted')]).indent).toBe('0')
  })

  it('keeps the indent the caller asked for, so nested output can hang', () => {
    expect(row([segment('- a bullet', 'body')], '2ch').indent).toBe('2ch')
  })

  it('keeps the segments in the order they were written', () => {
    const parts = [segment('name', 'muted'), segment('Payam Yasaie', 'text')]
    expect(row(parts).segments).toEqual(parts)
  })
})

describe('plain', () => {
  it('wraps a single row as the line kind the renderer draws one row for', () => {
    const only = row([segment('/home/payam/eindhoven', 'body')])
    expect(plain(only)).toEqual({ kind: 'plain', row: only })
  })
})

describe('text', () => {
  it('spells the common case of one coloured string as one plain row', () => {
    expect(text('brewing… done. black, no sugar.', 'accent')).toEqual({
      kind: 'plain',
      row: {
        segments: [{ text: 'brewing… done. black, no sugar.', colour: 'accent' }],
        indent: '0',
      },
    })
  })

  it('passes an indent through to the row it builds', () => {
    expect(text('- full stack, mostly TypeScript.', 'body', '2ch')).toEqual({
      kind: 'plain',
      row: {
        segments: [{ text: '- full stack, mostly TypeScript.', colour: 'body' }],
        indent: '2ch',
      },
    })
  })
})

describe('blank', () => {
  it('is a plain row carrying no segments, which is how the machine spells empty', () => {
    expect(blank).toEqual({ kind: 'plain', row: { segments: [], indent: '0' } })
  })
})

describe('responsive', () => {
  it('carries the wide row and its stacked replacements side by side', () => {
    const wide = row([segment('mail      ', 'muted'), segment('payam@yasaie.com', 'text')])
    const narrow = [
      row([segment('mail', 'muted')]),
      row([segment('payam@yasaie.com', 'text')], '2ch'),
    ]
    expect(responsive(wide, narrow)).toEqual({ kind: 'responsive', wide, narrow })
  })
})

describe('wordmark', () => {
  it('carries its glyph row as raw text, because the banner is never recoloured', () => {
    expect(wordmark('   ██║    ██║  ██║')).toEqual({
      kind: 'wordmark',
      text: '   ██║    ██║  ██║',
    })
  })
})

describe('every builder', () => {
  it('hands back a plain line nothing downstream can mutate', () => {
    const only = segment('total 5', 'muted')
    const single = row([only])
    const line = plain(single)
    expect(Object.isFrozen(line)).toBe(true)
    expect(Object.isFrozen(single)).toBe(true)
    expect(Object.isFrozen(single.segments)).toBe(true)
    expect(Object.isFrozen(only)).toBe(true)
  })

  it('hands back a responsive line nothing downstream can mutate', () => {
    const stacked = row([segment('Eindhoven, NL', 'body')], '2ch')
    const narrow = [stacked]
    expect(Object.isFrozen(responsive(row([segment('where  ', 'muted')]), narrow))).toBe(true)
    expect(Object.isFrozen(narrow)).toBe(true)
    expect(Object.isFrozen(stacked)).toBe(true)
  })

  it('hands back a wordmark line nothing downstream can mutate', () => {
    expect(Object.isFrozen(wordmark('YASAIE'))).toBe(true)
  })

  it('hands back a blank line nothing downstream can mutate', () => {
    expect(Object.isFrozen(blank)).toBe(true)
  })
})

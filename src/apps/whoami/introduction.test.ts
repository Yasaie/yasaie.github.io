import { describe, expect, it } from 'vitest'
import { screenText } from '@/testing/screen/screen'
import { introductionLines } from './introduction'

const document = [
  'Payam Yasaie',
  'senior software engineer · GoodHabitz · Eindhoven, NL',
  'full stack since 2010.',
  '',
  'before GoodHabitz: a lot of other things.',
  '',
  'persian native · english fluent',
  'bsc information technology, 2015',
].join('\n')

describe('the introduction a visitor reads', () => {
  it('breaks the headline once, so the role leads and the rest follows it', () => {
    expect(screenText(introductionLines(document), 'narrow')).toContain('senior software engineer')
    expect(screenText(introductionLines(document), 'narrow')).toContain(
      'GoodHabitz · Eindhoven, NL',
    )
  })

  it('breaks the languages at every separator, since none of them leads the others', () => {
    const narrow = screenText(introductionLines(document), 'narrow')

    expect(narrow).toContain('persian native')
    expect(narrow).toContain('english fluent')
  })

  it('keeps a headline that carries no separator on one line rather than splitting it oddly', () => {
    const plain = document.replace(
      'senior software engineer · GoodHabitz · Eindhoven, NL',
      'engineer',
    )

    expect(screenText(introductionLines(plain), 'narrow')).toContain('engineer')
  })

  it('still prints something when the document has lost its blocks', () => {
    expect(screenText(introductionLines(''))).toEqual(['', '', '', '', '', '', ''])
  })
})

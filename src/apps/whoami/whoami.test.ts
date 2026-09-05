import { describe, expect, it } from 'vitest'
import { whoami } from '@/apps/whoami/whoami'
import { mountRealDisk } from '@/test/disk/disk'
import { invocation } from '@/test/invocation/invocation'
import { coloursOf, textOf } from '@/test/rows/rows'

const volume = await mountRealDisk()

const introduction = whoami.run(invocation('whoami'), volume)

describe('whoami', () => {
  it('introduces the author in the order the profile document tells it', () => {
    expect(textOf(introduction)).toEqual([
      'Payam Yasaie',
      'senior software engineer · GoodHabitz · Eindhoven, NL',
      'full stack since 2010. Tabriz, then Eindhoven.',
      '',
      'before GoodHabitz: headless Shopify at OWOW Agency, a ten-person Odoo team in Tabriz, a legacy C++ HVAC tool rebuilt for the web, Moodle made fast for five universities.',
      '',
      'persian native · english fluent · dutch intermediate',
      'bsc information technology, payam noor university, 2015',
    ])
  })

  it('gives the name the brightest colour and the credentials the quietest', () => {
    expect(coloursOf(introduction)).toEqual([
      ['text'],
      ['body'],
      ['body'],
      [],
      ['body'],
      [],
      ['muted'],
      ['muted'],
    ])
  })

  it('breaks the headline once and the languages at every separator on a narrow screen', () => {
    expect(textOf(introduction, 'narrow')).toEqual([
      'Payam Yasaie',
      'senior software engineer',
      'GoodHabitz · Eindhoven, NL',
      'full stack since 2010. Tabriz, then Eindhoven.',
      '',
      'before GoodHabitz: headless Shopify at OWOW Agency, a ten-person Odoo team in Tabriz, a legacy C++ HVAC tool rebuilt for the web, Moodle made fast for five universities.',
      '',
      'persian native',
      'english fluent',
      'dutch intermediate',
      'bsc information technology, payam noor university, 2015',
    ])
  })

  it('only prints, so the terminal it runs in is left alone', () => {
    expect(introduction.effects).toEqual([])
  })
})

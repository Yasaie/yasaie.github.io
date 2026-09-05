import { describe, expect, it } from 'vitest'
import { mountRealDisk } from '#tests/helpers/disk'
import { invocation } from '#tests/helpers/invocation'
import { coloursOf, textOf } from '#tests/helpers/rows'
import { whoami } from '@/apps/whoami/whoami'

const volume = await mountRealDisk()

const introduction = whoami.run(invocation('whoami'), volume)

describe('whoami', () => {
  it('introduces the author in the order the profile document tells it', () => {
    expect(textOf(introduction)).toEqual([
      'Payam Yasaie',
      'senior software engineer · GoodHabitz · Eindhoven, NL',
      'full stack since 2010. Tabriz, then Eindhoven.',
      '',
      'before GoodHabitz: four years at OWOW in Eindhoven, building headless Shopify storefronts and client apps in Vue.',
      'before that, eleven years in Tabriz: led ten developers on Odoo, put a Vue front end on Moodle for five universities, moved a C++ HVAC calculator onto the web.',
      '',
      'Persian native · English fluent · Dutch intermediate',
      'BSc Information Technology, Payam Noor University, 2015',
    ])
  })

  it('gives the name the brightest colour and the credentials the quietest', () => {
    expect(coloursOf(introduction)).toEqual([
      ['text'],
      ['body'],
      ['body'],
      [],
      ['body'],
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
      'before GoodHabitz: four years at OWOW in Eindhoven, building headless Shopify storefronts and client apps in Vue.',
      'before that, eleven years in Tabriz: led ten developers on Odoo, put a Vue front end on Moodle for five universities, moved a C++ HVAC calculator onto the web.',
      '',
      'Persian native',
      'English fluent',
      'Dutch intermediate',
      'BSc Information Technology, Payam Noor University, 2015',
    ])
  })

  it('only prints, so the terminal it runs in is left alone', () => {
    expect(introduction.effects).toEqual([])
  })
})

import { describe, expect, it } from 'vitest'
import { work } from '@/apps/work/work'
import { workPath } from '@/fs/path/path'
import { execute } from '@/kernel/execute/execute'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { coloursOf, indentsOf, textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

const listing = work.run(invocation('work'), volume)

describe('work', () => {
  it('lists all six chapters newest first, in aligned year and company columns', () => {
    expect(textOf(listing)).toEqual([
      '[1]  2025 – now   GoodHabitz           senior software engineer',
      '[2]  2021 – 2025  OWOW Agency          software developer, then senior',
      "[3]  2019 – 2021  Tas'hil Gostar       team lead, senior Python developer",
      '[4]  2018 – 2019  Tahlilgaran          senior full stack developer',
      '[5]  2017         Tabesh Rayan Energy  full stack developer',
      '[6]  2010 – 2016  freelance            full stack developer',
      '',
      'work <n> for details. all of it shipped behind logins; nothing to click.',
    ])
  })

  it('brightens only the current chapter so the eye lands on it first', () => {
    expect(coloursOf(listing)).toEqual([
      ['text'],
      ['body'],
      ['body'],
      ['body'],
      ['body'],
      ['body'],
      [],
      ['muted'],
    ])
  })

  it('drops the years under the company, indented, when the screen is narrow', () => {
    expect(textOf(listing, 'narrow')).toEqual([
      '[1]  GoodHabitz',
      '2025 – now · senior software engineer',
      '[2]  OWOW Agency',
      '2021 – 2025 · software developer, then senior',
      "[3]  Tas'hil Gostar",
      '2019 – 2021 · team lead, senior Python developer',
      '[4]  Tahlilgaran',
      '2018 – 2019 · senior full stack developer',
      '[5]  Tabesh Rayan Energy',
      '2017 · full stack developer',
      '[6]  freelance',
      '2010 – 2016 · full stack developer',
      '',
      'work <n> for details. all of it shipped behind logins; nothing to click.',
    ])
    expect(indentsOf(listing, 'narrow')).toEqual([
      '0',
      '5ch',
      '0',
      '5ch',
      '0',
      '5ch',
      '0',
      '5ch',
      '0',
      '5ch',
      '0',
      '5ch',
      '0',
      '0',
    ])
  })

  it('opens the chapter a visitor asks for by number, bullets indented under its credits', () => {
    const chapter = work.run(invocation('work 1'), volume)
    expect(textOf(chapter)).toEqual([
      '2025 – now  GoodHabitz',
      'senior software engineer · Eindhoven',
      '',
      '- learning platform used by millions of learners across Europe.',
      '- learner-facing work for the learning experience team, in Vue, React and Nuxt.',
      '- led the refactoring that let it scale, and kept it stable while it did.',
      '- raised test coverage and reshaped the front-end architecture behind it.',
      '- initiatives owned end to end, from the idea to the thing that ships.',
    ])
    expect(coloursOf(chapter)).toEqual([
      ['text'],
      ['muted'],
      [],
      ['body'],
      ['body'],
      ['body'],
      ['body'],
      ['body'],
    ])
    expect(indentsOf(chapter)).toEqual(['0', '0', '0', '2ch', '2ch', '2ch', '2ch', '2ch'])
  })

  it('keeps a role that carries its own comma out of the place it was held in', () => {
    expect(textOf(work.run(invocation('work 3'), volume))).toEqual([
      "2019 – 2021  Tas'hil Gostar",
      'team lead, senior Python developer · Tabriz',
      '',
      '- led ten developers customising and rolling out Odoo ERP.',
      '- 20+ custom modules: accounting, payroll, inventory.',
      '- query optimisation: 10× faster. Git + CI/CD: deploys 70% quicker.',
      '- migrated twenty clients across Odoo versions.',
    ])
  })

  it('says so when the chapter asked for does not exist, rather than quietly listing again', () => {
    const missing = work.run(invocation('work 9'), volume)

    expect(textOf(missing)).toEqual(['work: no chapter 9'])
    expect(coloursOf(missing)).toEqual([['muted']])
  })

  it('quotes the argument as typed when it is not a chapter number at all', () => {
    expect(textOf(work.run(invocation('work later'), volume))).toEqual(['work: no chapter later'])
  })

  it('opens the chapter another program hands it by its path on the volume', () => {
    expect(
      textOf(work.run(invocation(`work ${workPath}/5-tabesh-rayan-energy.md`), volume)),
    ).toEqual([
      '2017  Tabesh Rayan Energy',
      'full stack developer · Tabriz',
      '',
      '- legacy C++ HVAC calculator rebuilt as a Laravel + Vue web app.',
      '- drag-and-drop floor-plan builder wired to energy-optimisation algorithms.',
      '- calculation time down 70%; 100+ concurrent users.',
    ])
  })

  it('answers to cv and history as well as to its own name', () => {
    expect(textOf(execute(invocation('cv'), volume))).toEqual(textOf(listing))
    expect(textOf(execute(invocation('history 6'), volume))).toEqual([
      '2010 – 2016  freelance',
      'full stack developer · Tabriz',
      '',
      '- PHP shops, B2B platforms, support desks, a Farsi word game.',
      '- gaming-tournament platform (Vue + Laravel), matchmaking for 10,000+ concurrent players.',
      '- steel-logistics system: load distribution and route optimisation, costs down 20%.',
      '- BSc Information Technology, Payam Noor University, 2015.',
    ])
  })

  it('only prints, so the terminal it runs in is left alone', () => {
    expect(listing.effects).toEqual([])
  })
})

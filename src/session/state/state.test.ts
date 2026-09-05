import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { diskRoot, mountRealDisk, realText } from '#tests/helpers/disk'
import { pinnedYear } from '#tests/helpers/pinned-year'
import { coloursOf, textOf } from '#tests/helpers/rows'
import { nodeSource } from '@/fs/node-source/node-source'
import { mount } from '@/fs/volume/volume'
import { totalCounted } from '@/session/progress/progress'
import { createSession, rewardSequence } from './state'

const volume = await mountRealDisk()

const splash = createSession(volume, pinnedYear).queue

const splashLines = splash.map((queued) => queued.line)

describe('a fresh session', () => {
  it('starts with an empty screen, an empty prompt and none of the game found', () => {
    const session = createSession(volume, pinnedYear)
    expect(session.lines).toEqual([])
    expect(session.typed).toBe('')
    expect(session.caret).toBe(0)
    expect(session.cwd).toBe('~')
    expect(session.discovered).toEqual([])
    expect(session.history).toEqual([])
    expect(session.scheduled).toEqual([])
  })

  it('has the whole boot splash waiting to be typed out, nothing of it printed yet', () => {
    expect(splashLines.length).toBeGreaterThan(0)
    expect(createSession(volume, pinnedYear).lines).toEqual([])
  })
})

describe('the boot splash', () => {
  it('opens with the banner the machine keeps in /etc/issue, byte for byte', () => {
    const banner = realText('/etc/issue').split('\n').slice(0, -1)
    expect(textOf(splashLines).slice(0, banner.length)).toEqual(banner)
    expect(splashLines.slice(0, banner.length).map((line) => line.kind)).toEqual(
      banner.map(() => 'wordmark'),
    )
  })

  it('introduces the machine from /etc/yasaie-release, in the order the file declares', () => {
    expect(textOf(splashLines).slice(7, 14)).toEqual([
      'name    Payam Yasaie',
      'role    senior software engineer',
      'at      GoodHabitz',
      'where   Eindhoven, NL',
      'uptime  16 years',
      'shell   zsh',
      'langs   ts · php · py · java',
    ])
  })

  it('brightens the name above the rest of the block', () => {
    expect(coloursOf(splashLines).slice(7, 14)).toEqual([
      ['muted', 'text'],
      ['muted', 'body'],
      ['muted', 'body'],
      ['muted', 'body'],
      ['muted', 'body'],
      ['muted', 'body'],
      ['muted', 'body'],
    ])
  })

  it('separates the banner, the introduction and the hint with blank lines', () => {
    const printed = textOf(splashLines)
    expect(printed.at(6)).toBe('')
    expect(printed.at(14)).toBe('')
    expect(printed.at(16)).toBe('')
  })

  it('closes by telling the visitor what to type, shortened when the screen is narrow', () => {
    const hint = splashLines.slice(15, 16)
    expect(textOf(hint)).toEqual(['type  help  or press tab'])
    expect(textOf(hint, 'narrow')).toEqual(['type  help'])
  })

  it('types itself out faster than ordinary command output', () => {
    expect(splash.map((queued) => queued.speedMs)).toEqual(splash.map(() => 14))
  })

  it('still boots on a disk that carries neither banner nor release block', async () => {
    const bootOnly = await mount(nodeSource(join(diskRoot, 'boot')))
    expect(textOf(createSession(bootOnly, pinnedYear).queue.map((queued) => queued.line))).toEqual([
      '',
      '',
      'type  help  or press tab',
      '',
    ])
  })
})

describe('the reward for finding everything', () => {
  it('thanks the visitor in accent and leaves an address to reply to', () => {
    expect(textOf(rewardSequence.map((queued) => queued.line))).toEqual([
      'all ten. anything the machine left out, ask me: payam@yasaie.com',
      '',
    ])
    expect(coloursOf(rewardSequence.map((queued) => queued.line)).at(0)).toEqual(['accent'])
  })

  it('congratulates the visitor on as many commands as the game actually counts', () => {
    const spelled = [
      'zero',
      'one',
      'two',
      'three',
      'four',
      'five',
      'six',
      'seven',
      'eight',
      'nine',
      'ten',
    ]

    expect(textOf(rewardSequence.map((queued) => queued.line)).at(0)).toContain(
      `all ${spelled.at(totalCounted)}.`,
    )
  })

  it('prints at the same speed as any other command output', () => {
    expect(rewardSequence.map((queued) => queued.speedMs)).toEqual(rewardSequence.map(() => 28))
  })
})

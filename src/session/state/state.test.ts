import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { nodeSource } from '@/fs/node-source/node-source'
import { mount } from '@/fs/volume/volume'
import { diskRoot, mountRealDisk, realText } from '@/test/disk/disk'
import { screenColours, screenText } from '@/test/screen/screen'
import { createSession, rewardSequence } from './state'

const volume = await mountRealDisk()

const splash = createSession(volume).queue

const splashLines = splash.map((queued) => queued.line)

describe('a fresh session', () => {
  it('starts with an empty screen, an empty prompt and none of the game found', () => {
    const session = createSession(volume)
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
    expect(createSession(volume).lines).toEqual([])
  })
})

describe('the boot splash', () => {
  it('opens with the banner the machine keeps in /etc/issue, byte for byte', () => {
    const banner = realText('/etc/issue').split('\n').slice(0, -1)
    expect(screenText(splashLines).slice(0, banner.length)).toEqual(banner)
    expect(splashLines.slice(0, banner.length).map((line) => line.kind)).toEqual(
      banner.map(() => 'wordmark'),
    )
  })

  it('introduces the machine from /etc/os-release, in the order the file declares', () => {
    expect(screenText(splashLines).slice(7, 14)).toEqual([
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
    expect(screenColours(splashLines).slice(7, 14)).toEqual([
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
    const printed = screenText(splashLines)
    expect(printed.at(6)).toBe('')
    expect(printed.at(14)).toBe('')
    expect(printed.at(16)).toBe('')
  })

  it('closes by telling the visitor what to type, shortened when the screen is narrow', () => {
    const hint = splashLines.slice(15, 16)
    expect(screenText(hint)).toEqual(['type  help  — or press tab'])
    expect(screenText(hint, 'narrow')).toEqual(['type  help'])
  })

  it('types itself out faster than ordinary command output', () => {
    expect(splash.map((queued) => queued.speedMs)).toEqual(splash.map(() => 14))
  })

  it('still boots on a disk that carries neither banner nor release block', async () => {
    const bootOnly = await mount(nodeSource(join(diskRoot, 'boot')))
    expect(screenText(createSession(bootOnly).queue.map((queued) => queued.line))).toEqual([
      '',
      '',
      'type  help  — or press tab',
      '',
    ])
  })
})

describe('the reward for finding everything', () => {
  it('thanks the visitor in accent and leaves an address to reply to', () => {
    expect(screenText(rewardSequence.map((queued) => queued.line))).toEqual([
      'all nine. you read the whole thing. that deserves a reply: payam@yasaie.com',
      '',
    ])
    expect(screenColours(rewardSequence.map((queued) => queued.line)).at(0)).toEqual(['accent'])
  })

  it('prints at the same speed as any other command output', () => {
    expect(rewardSequence.map((queued) => queued.speedMs)).toEqual(rewardSequence.map(() => 28))
  })
})

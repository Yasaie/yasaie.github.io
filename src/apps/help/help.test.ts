import { describe, expect, it } from 'vitest'
import { execute } from '@/kernel/execute/execute'
import { mountRealDisk } from '@/test/disk/disk'
import { invocation } from '@/test/invocation/invocation'
import { coloursOf, indentsOf, textOf } from '@/test/rows/rows'

const volume = await mountRealDisk()

const listing = execute(invocation('help'), volume)

describe('help', () => {
  it('lists the six commands worth naming, each with its own one-line summary', () => {
    expect(textOf(listing)).toEqual([
      'whoami   who is typing on the other side',
      'work     six chapters, 2010 to now · work <n> for one',
      'stack    what I build with',
      'contact  say hi',
      'clear    wipe the screen',
      'reboot   you know what this does',
      '',
      'there are a few more. guess.',
    ])
  })

  it('leaves the hidden commands to be guessed rather than naming them', () => {
    const printed = textOf(listing).join('\n')
    expect(printed).not.toContain('sudo')
    expect(printed).not.toContain('tabriz')
    expect(printed).not.toContain('coffee')
    expect(printed).not.toContain('impossible')
    expect(printed).not.toContain('help')
  })

  it('brightens the command names above their descriptions', () => {
    expect(coloursOf(listing)).toEqual([
      ['text', 'body'],
      ['text', 'body'],
      ['text', 'body'],
      ['text', 'body'],
      ['text', 'body'],
      ['text', 'body'],
      [],
      ['muted'],
    ])
  })

  it('drops each summary under its command, indented, when the screen is narrow', () => {
    expect(textOf(listing, 'narrow')).toEqual([
      'whoami',
      'who is typing on the other side',
      'work',
      'six chapters, 2010 to now · work <n> for one',
      'stack',
      'what I build with',
      'contact',
      'say hi',
      'clear',
      'wipe the screen',
      'reboot',
      'you know what this does',
      '',
      'there are a few more. guess.',
    ])
    expect(indentsOf(listing, 'narrow')).toEqual([
      '0',
      '2ch',
      '0',
      '2ch',
      '0',
      '2ch',
      '0',
      '2ch',
      '0',
      '2ch',
      '0',
      '2ch',
      '0',
      '0',
    ])
  })

  it('answers to a bare question mark', () => {
    expect(textOf(execute(invocation('?'), volume))).toEqual(textOf(listing))
  })

  it('only prints, so the terminal it runs in is left alone', () => {
    expect(listing.effects).toEqual([])
  })
})

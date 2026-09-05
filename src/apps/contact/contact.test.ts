import { describe, expect, it } from 'vitest'
import { contact } from '@/apps/contact/contact'
import { execute } from '@/kernel/execute/execute'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { coloursOf, indentsOf, textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

const details = contact.run(invocation('contact'), volume)

describe('contact', () => {
  it('gives every way of reaching the author, values aligned in one column', () => {
    expect(textOf(details)).toEqual([
      'mail      payam@yasaie.com',
      'linkedin  linkedin.com/in/yasaie',
      'github    github.com/yasaie',
      'where     eindhoven, nederland',
    ])
  })

  it('brightens the mail address and dims the city, since only one of them is an invitation', () => {
    expect(coloursOf(details)).toEqual([
      ['muted', 'text'],
      ['muted', 'body'],
      ['muted', 'body'],
      ['muted', 'muted'],
    ])
  })

  it('drops each value under its label, indented, when the screen is narrow', () => {
    expect(textOf(details, 'narrow')).toEqual([
      'mail',
      'payam@yasaie.com',
      'linkedin',
      'linkedin.com/in/yasaie',
      'github',
      'github.com/yasaie',
      'where',
      'eindhoven, nederland',
    ])
    expect(indentsOf(details, 'narrow')).toEqual(['0', '2ch', '0', '2ch', '0', '2ch', '0', '2ch'])
  })

  it('answers to hi and hello, the words a visitor reaches for first', () => {
    expect(textOf(execute(invocation('hi'), volume))).toEqual(textOf(details))
    expect(textOf(execute(invocation('hello'), volume))).toEqual(textOf(details))
  })

  it('answers to the name of any one way of reaching him, since that is what was asked for', () => {
    for (const asked of ['mail', 'email', 'linkedin', 'github']) {
      expect(textOf(execute(invocation(asked), volume))).toEqual(textOf(details))
    }
  })

  it('only prints, so the terminal it runs in is left alone', () => {
    expect(details.effects).toEqual([])
  })
})

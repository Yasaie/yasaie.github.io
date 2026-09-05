import { describe, expect, it } from 'vitest'
import { hire } from '@/apps/hire/hire'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { coloursOf, textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

describe('hire', () => {
  it('answers the question the whole terminal exists to be asked, with an address', () => {
    const answer = hire.run(invocation('hire'), volume)

    expect(textOf(answer).join('')).toContain('payam@yasaie.com')
    expect(coloursOf(answer)).toEqual([['accent']])
    expect(answer.effects).toEqual([])
  })

  it('answers to the longer way of asking as well', () => {
    expect(hire.aliases).toContain('work-with-me')
  })
})

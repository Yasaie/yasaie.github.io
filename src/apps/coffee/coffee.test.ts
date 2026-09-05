import { describe, expect, it } from 'vitest'
import { coffee } from '@/apps/coffee/coffee'
import { mountRealDisk } from '@/test/disk/disk'
import { invocation } from '@/test/invocation/invocation'
import { coloursOf, textOf } from '@/test/rows/rows'

const volume = await mountRealDisk()

describe('coffee', () => {
  it('brews and reports it done, ellipsis and all', () => {
    const answer = coffee.run(invocation('coffee'), volume)
    expect(textOf(answer)).toEqual(['brewing… done. black, no sugar.'])
    expect(coloursOf(answer)).toEqual([['accent']])
    expect(answer.effects).toEqual([])
  })

  it('brews the same way no matter what it was asked for', () => {
    expect(textOf(coffee.run(invocation('coffee latte please'), volume))).toEqual([
      'brewing… done. black, no sugar.',
    ])
  })
})

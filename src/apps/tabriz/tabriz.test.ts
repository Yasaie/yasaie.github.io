import { describe, expect, it } from 'vitest'
import { tabriz } from '@/apps/tabriz/tabriz'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { coloursOf, textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

describe('tabriz', () => {
  it('names the coordinates and the kebab claim exactly, degree signs and all', () => {
    const answer = tabriz.run(invocation('tabriz'), volume)
    expect(textOf(answer)).toEqual([
      '38.08° N, 46.29° E. where it started. best kebab in iran, not up for debate.',
    ])
    expect(coloursOf(answer)).toEqual([['accent']])
    expect(answer.effects).toEqual([])
  })

  it('ignores whatever follows it, since the coordinates never move', () => {
    expect(textOf(tabriz.run(invocation('tabriz debate this'), volume))).toEqual([
      '38.08° N, 46.29° E. where it started. best kebab in iran, not up for debate.',
    ])
  })
})

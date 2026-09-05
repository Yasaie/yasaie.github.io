import { describe, expect, it } from 'vitest'
import { mountRealDisk } from '#tests/helpers/disk'
import { invocation } from '#tests/helpers/invocation'
import { coloursOf, textOf } from '#tests/helpers/rows'
import { tabriz } from '@/apps/tabriz/tabriz'

const volume = await mountRealDisk()

describe('tabriz', () => {
  it('names the coordinates and what the city is known for, degree signs and all', () => {
    const answer = tabriz.run(invocation('tabriz'), volume)
    expect(textOf(answer)).toEqual([
      '38.08° N, 46.29° E. where it started. carpets, the largest covered bazaar on earth, and iran’s first of nearly everything.',
    ])
    expect(coloursOf(answer)).toEqual([['accent']])
    expect(answer.effects).toEqual([])
  })

  it('ignores whatever follows it, since the coordinates never move', () => {
    expect(textOf(tabriz.run(invocation('tabriz debate this'), volume))).toEqual([
      '38.08° N, 46.29° E. where it started. carpets, the largest covered bazaar on earth, and iran’s first of nearly everything.',
    ])
  })
})

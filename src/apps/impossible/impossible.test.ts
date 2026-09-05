import { describe, expect, it } from 'vitest'
import { impossible } from '@/apps/impossible/impossible'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { coloursOf, textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

describe('impossible', () => {
  it('prints the line the author keeps on the wall, quoted verbatim with an em dash', () => {
    const answer = impossible.run(invocation('impossible'), volume)
    expect(textOf(answer)).toEqual([
      '"nothing is impossible — only problems awaiting creative solutions."',
    ])
    expect(coloursOf(answer)).toEqual([['accent']])
    expect(answer.effects).toEqual([])
  })

  it('ignores whatever follows it, since the line never changes', () => {
    expect(textOf(impossible.run(invocation('impossible really'), volume))).toEqual([
      '"nothing is impossible — only problems awaiting creative solutions."',
    ])
  })
})

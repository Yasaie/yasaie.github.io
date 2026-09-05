import { describe, expect, it } from 'vitest'
import { clear } from '@/apps/clear/clear'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

describe('clear', () => {
  it('prints nothing of its own, leaving the wipe entirely to its effect', () => {
    const wiped = clear.run(invocation('clear'), volume)
    expect(textOf(wiped)).toEqual([])
    expect(wiped.effects).toEqual([{ kind: 'clear' }])
  })

  it('wipes the same way no matter what is typed after it', () => {
    expect(clear.run(invocation('clear -f now'), volume).effects).toEqual([{ kind: 'clear' }])
  })
})

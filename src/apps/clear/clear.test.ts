import { describe, expect, it } from 'vitest'
import { clear } from '@/apps/clear/clear'
import { mountRealDisk } from '@/test/disk/disk'
import { invocation } from '@/test/invocation/invocation'
import { textOf } from '@/test/rows/rows'

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

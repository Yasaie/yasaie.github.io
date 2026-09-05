import { describe, expect, it } from 'vitest'
import { exit } from '@/apps/exit/exit'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { coloursOf, textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

describe('exit', () => {
  it('tells the visitor there is no way out, pointing at clear instead', () => {
    const answer = exit.run(invocation('exit'), volume)
    expect(textOf(answer)).toEqual(['there is no exit. only  clear'])
    expect(coloursOf(answer)).toEqual([['muted']])
  })

  it('never changes the terminal, since leaving is not really on offer', () => {
    expect(exit.run(invocation('exit'), volume).effects).toEqual([])
  })
})

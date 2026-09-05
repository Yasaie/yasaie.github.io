import { describe, expect, it } from 'vitest'
import { sudo } from '@/apps/sudo/sudo'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { coloursOf, textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

describe('sudo', () => {
  it('refuses the privilege it is asked for, in the machine’s brightest colour', () => {
    const answer = sudo.run(invocation('sudo'), volume)
    expect(textOf(answer)).toEqual(['permission denied. respect, though.'])
    expect(coloursOf(answer)).toEqual([['accent']])
    expect(answer.effects).toEqual([])
  })

  it('refuses the same way no matter what it was asked to run as root', () => {
    expect(textOf(sudo.run(invocation('sudo rm -rf /'), volume))).toEqual([
      'permission denied. respect, though.',
    ])
  })
})

import { describe, expect, it } from 'vitest'
import { mountRealDisk } from '#tests/helpers/disk'
import { invocation } from '#tests/helpers/invocation'
import { coloursOf, textOf } from '#tests/helpers/rows'
import { sudo } from '@/apps/sudo/sudo'

const volume = await mountRealDisk()

describe('sudo', () => {
  it('refuses the privilege it is asked for, in the machine’s brightest colour', () => {
    const answer = sudo.run(invocation('sudo'), volume)
    expect(textOf(answer)).toEqual([
      'payam is not in the sudoers file. this incident will be reported.',
    ])
    expect(coloursOf(answer)).toEqual([['accent']])
    expect(answer.effects).toEqual([])
  })

  it('refuses the same way no matter what it was asked to run as root', () => {
    expect(textOf(sudo.run(invocation('sudo rm -rf /'), volume))).toEqual([
      'payam is not in the sudoers file. this incident will be reported.',
    ])
  })
})

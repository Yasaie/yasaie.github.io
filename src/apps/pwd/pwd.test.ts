import { describe, expect, it } from 'vitest'
import { mountRealDisk } from '#tests/helpers/disk'
import { invocation } from '#tests/helpers/invocation'
import { coloursOf, textOf } from '#tests/helpers/rows'
import { pwd } from '@/apps/pwd/pwd'

const volume = await mountRealDisk()

describe('pwd', () => {
  it('prints the absolute path of the home directory the visitor starts in', () => {
    const output = pwd.run(invocation('pwd'), volume)
    expect(textOf(output)).toEqual(['/home/payam/eindhoven'])
    expect(coloursOf(output)).toEqual([['body']])
    expect(output.effects).toEqual([])
  })

  it('follows the visitor into the work directory', () => {
    expect(textOf(pwd.run(invocation('pwd', '~/work'), volume))).toEqual([
      '/home/payam/eindhoven/work',
    ])
  })
})

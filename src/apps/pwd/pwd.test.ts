import { describe, expect, it } from 'vitest'
import { pwd } from '@/apps/pwd/pwd'
import { mountRealDisk } from '@/test/disk/disk'
import { invocation } from '@/test/invocation/invocation'
import { coloursOf, textOf } from '@/test/rows/rows'

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

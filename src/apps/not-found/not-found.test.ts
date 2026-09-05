import { describe, expect, it } from 'vitest'
import { mountRealDisk } from '#tests/helpers/disk'
import { invocation } from '#tests/helpers/invocation'
import { coloursOf, textOf } from '#tests/helpers/rows'
import { notFound } from '@/apps/not-found/not-found'
import { execute } from '@/kernel/execute/execute'

const volume = await mountRealDisk()

describe('not-found', () => {
  it('names exactly the program the visitor typed, not its own name', () => {
    const answer = notFound.run(invocation('sl'), volume)
    expect(textOf(answer)).toEqual(['zsh: command not found: sl'])
    expect(coloursOf(answer)).toEqual([['muted']])
    expect(answer.effects).toEqual([])
  })

  it('is what the machine reaches for when nothing else claims a typed word', () => {
    expect(textOf(execute(invocation('made-up-command'), volume))).toEqual([
      'zsh: command not found: made-up-command',
    ])
  })
})

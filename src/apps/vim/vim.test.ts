import { describe, expect, it } from 'vitest'
import { vim } from '@/apps/vim/vim'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { coloursOf, textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

describe('vim', () => {
  it('declines to open an editor, and says why nobody would want it to', () => {
    const answer = vim.run(invocation('vim'), volume)

    expect(textOf(answer).at(0)).toBe('not installed. you would only have asked how to leave.')
    expect(answer.effects).toEqual([])
  })

  it('turns the refusal into the offer, since wanting an editor is wanting something built', () => {
    const answer = vim.run(invocation('vim'), volume)

    expect(textOf(answer).at(1)).toContain('hand me that part')
    expect(coloursOf(answer)).toEqual([['accent'], ['accent']])
  })

  it('declines under every name the argument has ever been had in', () => {
    expect(vim.aliases).toEqual(['emacs', 'nano'])
  })
})

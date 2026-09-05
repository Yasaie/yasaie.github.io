import { describe, expect, it } from 'vitest'
import { vim } from '@/apps/vim/vim'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { coloursOf, textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

describe('vim', () => {
  it('turns the refusal into the offer, since wanting an editor is wanting something built', () => {
    const answer = vim.run(invocation('vim'), volume)

    expect(textOf(answer)).toEqual(['no vim. you have the idea, i have the keyboard.'])
    expect(coloursOf(answer)).toEqual([['accent']])
    expect(answer.effects).toEqual([])
  })

  it('declines under every name the argument has ever been had in', () => {
    expect(vim.aliases).toEqual(['emacs', 'nano'])
  })
})

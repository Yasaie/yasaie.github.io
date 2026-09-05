import { describe, expect, it } from 'vitest'
import { vim } from '@/apps/vim/vim'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { coloursOf, textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

describe('vim', () => {
  it('declines to open an editor, and says why nobody would want it to', () => {
    const answer = vim.run(invocation('vim'), volume)

    expect(textOf(answer)).toEqual(['not installed. you would only have asked how to leave.'])
    expect(coloursOf(answer)).toEqual([['accent']])
    expect(answer.effects).toEqual([])
  })

  it('declines under every name the argument is ever had in', () => {
    expect(vim.aliases).toEqual(['emacs', 'nano'])
  })
})

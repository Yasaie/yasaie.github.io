import { describe, expect, it } from 'vitest'
import { vim } from '@/apps/vim/vim'
import { execute } from '@/kernel/execute/execute'
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

  it('refuses the editor that was actually asked for, not the one it is filed under', () => {
    expect(textOf(execute(invocation('nano'), volume)).at(0)).toContain('no nano.')
    expect(textOf(execute(invocation('emacs'), volume)).at(0)).toContain('no emacs.')
  })
})

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PromptGhost } from './prompt-ghost'

const caretDrawn = (focused: boolean): CSSStyleDeclaration => {
  const { container } = render(<PromptGhost beforeCaret="" ghost="" focused={focused} />)
  const caret = container.querySelector('[data-caret]')
  if (caret === null) throw new Error('the prompt drew no cursor')
  return getComputedStyle(caret)
}

const strengthOf = (focused: boolean): number => Number(caretDrawn(focused).opacity)

describe('the block cursor drawn behind the prompt', () => {
  it('dims once the prompt loses focus, so the screen looks asleep', () => {
    expect(strengthOf(false)).toBeLessThan(strengthOf(true))
  })

  it('stays on screen while it sleeps, so the visitor can see where typing lands', () => {
    expect(strengthOf(false)).toBeGreaterThan(0)
  })

  it('blinks only while the prompt is awake, the way a terminal cursor does', () => {
    expect(caretDrawn(true).animationName).not.toBe('none')
    expect(caretDrawn(false).animationName).toBe('none')
  })
})

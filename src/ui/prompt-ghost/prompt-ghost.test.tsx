import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PromptGhost } from './prompt-ghost'

describe('the block cursor and the suggestion behind the prompt', () => {
  it('shows the rest of the suggested command after the cursor', () => {
    const { container } = render(<PromptGhost beforeCaret="sta" ghost="ck" focused={true} />)
    expect(container.textContent).toBe('stack')
  })

  it('hides the letters already typed, so only the cursor lines up over them', () => {
    render(<PromptGhost beforeCaret="sta" ghost="ck" focused={true} />)
    expect(screen.getByText('sta')).toHaveClass('invisible')
  })

  it('is decorative, so a screen reader never reads the line twice', () => {
    const { container } = render(<PromptGhost beforeCaret="sta" ghost="ck" focused={true} />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('dims the cursor while the prompt does not have focus', () => {
    const { container } = render(<PromptGhost beforeCaret="" ghost="" focused={false} />)
    expect(container.querySelector('span:last-of-type')).toHaveClass('opacity-35')
  })

  it('shows the cursor at full strength while the prompt has focus', () => {
    const { container } = render(<PromptGhost beforeCaret="" ghost="" focused={true} />)
    expect(container.querySelector('span:last-of-type')).toHaveClass('opacity-100')
  })
})

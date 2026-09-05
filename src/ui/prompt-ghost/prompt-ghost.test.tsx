import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PromptGhost } from './prompt-ghost'

describe('the block cursor and the suggestion behind the prompt', () => {
  it('shows the rest of the suggested command after the cursor', () => {
    const { container } = render(<PromptGhost beforeCaret="sta" ghost="ck" focused={true} />)
    expect(container.textContent).toBe('stack')
  })

  it('carries the letters already typed so the cursor lines up over them', () => {
    render(<PromptGhost beforeCaret="sta" ghost="ck" focused={true} />)
    expect(screen.getByText('sta')).toBeInTheDocument()
  })

  it('is decorative, so a screen reader never reads the line twice', () => {
    const { container } = render(<PromptGhost beforeCaret="sta" ghost="ck" focused={true} />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})

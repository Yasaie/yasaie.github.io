import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PromptStatus } from './prompt-status'

describe('the status beside the prompt', () => {
  it('shows how far through the game the visitor is', () => {
    render(<PromptStatus label="tab ↹ · 3/9" />)
    expect(screen.getByText('tab ↹ · 3/9')).toBeInTheDocument()
  })
})

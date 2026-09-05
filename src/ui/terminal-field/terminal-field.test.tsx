import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TerminalField } from './terminal-field'

describe('the surface the ripples are drawn on', () => {
  it('is decoration, so nothing in it is read out or clickable', () => {
    const { container } = render(<TerminalField />)

    expect(container.firstElementChild?.tagName).toBe('CANVAS')
    expect(container.firstElementChild).toHaveClass('pointer-events-none')
  })
})

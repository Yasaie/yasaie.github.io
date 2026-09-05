import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TerminalBackdrop } from './terminal-backdrop'

describe('the dot grid behind the terminal', () => {
  it('is decoration, so nothing in it is read out or clickable', () => {
    const { container } = render(<TerminalBackdrop />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
    expect(container.firstElementChild).toHaveClass('pointer-events-none')
  })

  it('gives the screen depth by drifting its layers by different amounts', () => {
    const { container } = render(<TerminalBackdrop />)

    fireEvent(window, new MouseEvent('mousemove', { clientX: 0, clientY: 0 }))

    const drifts = [...container.querySelectorAll('div')].map((layer) => layer.style.transform)
    expect(drifts).toEqual([
      '',
      'translate(5px,5px)',
      'translate(12px,12px)',
      'translate(24px,24px)',
      '',
    ])
  })
})

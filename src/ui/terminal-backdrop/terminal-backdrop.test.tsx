import { act, fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TerminalBackdrop } from './terminal-backdrop'

const shiftOf = (layer: HTMLElement): number =>
  Number.parseFloat(/translate\((-?[\d.]+)px/.exec(layer.style.transform)?.[1] ?? '0')

describe('the dot grid behind the terminal', () => {
  it('is decoration, so nothing in it is read out or clickable', () => {
    const { container } = render(<TerminalBackdrop />)

    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })

  it('gives the screen depth by drifting its layers by different amounts', async () => {
    const { container } = render(<TerminalBackdrop />)

    await act(async () => {
      fireEvent(window, new MouseEvent('mousemove', { clientX: 0, clientY: 0 }))
      await new Promise((painted) => requestAnimationFrame(() => painted(undefined)))
    })

    const drifted = [...container.querySelectorAll<HTMLElement>('div')]
      .map(shiftOf)
      .filter((shift) => shift !== 0)

    expect(drifted).toHaveLength(3)
    expect(drifted).toEqual([...drifted].toSorted((a, b) => a - b))
  })
})

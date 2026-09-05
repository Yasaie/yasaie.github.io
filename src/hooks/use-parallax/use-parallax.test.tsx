import { fireEvent, render, renderHook } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { useParallax } from './use-parallax'

const nearDepth = 10
const farDepth = 48

const Layers = (): ReactElement => {
  const near = useParallax<HTMLDivElement>(nearDepth)
  const far = useParallax<HTMLDivElement>(farDepth)
  return (
    <>
      <div data-testid="near" ref={near} />
      <div data-testid="far" ref={far} />
    </>
  )
}

const moveTo = (x: number, y: number): void => {
  fireEvent(window, new MouseEvent('mousemove', { clientX: x, clientY: y }))
}

describe('the dot layers behind the terminal', () => {
  it('drifts against the pointer, the deeper layer further than the nearer one', () => {
    const view = render(<Layers />)

    moveTo(window.innerWidth, window.innerHeight)

    expect(view.getByTestId('near').style.transform).toBe('translate(-5px,-5px)')
    expect(view.getByTestId('far').style.transform).toBe('translate(-24px,-24px)')
  })

  it('drifts the other way once the pointer crosses to the other side', () => {
    const view = render(<Layers />)

    moveTo(0, 0)

    expect(view.getByTestId('near').style.transform).toBe('translate(5px,5px)')
  })

  it('ignores the pointer while a layer has not been painted onto the page yet', () => {
    renderHook(() => useParallax<HTMLDivElement>(nearDepth))

    expect(() => moveTo(0, 0)).not.toThrow()
  })

  it('stops following the pointer once the terminal is gone', () => {
    const view = render(<Layers />)
    moveTo(0, 0)
    const layer = view.getByTestId('near')
    view.unmount()

    moveTo(window.innerWidth, window.innerHeight)

    expect(layer.style.transform).toBe('translate(5px,5px)')
  })
})

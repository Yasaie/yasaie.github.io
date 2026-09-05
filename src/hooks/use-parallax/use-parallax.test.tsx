import { act, fireEvent, render, renderHook } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { preferStillness } from '#tests/helpers/viewport'
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

const moveTo = async (x: number, y: number): Promise<void> => {
  await act(async () => {
    fireEvent(window, new MouseEvent('mousemove', { clientX: x, clientY: y }))
    await new Promise((painted) => requestAnimationFrame(() => painted(undefined)))
  })
}

describe('the dot layers behind the terminal', () => {
  it('drifts against the pointer, the deeper layer further than the nearer one', async () => {
    const view = render(<Layers />)

    await moveTo(window.innerWidth, window.innerHeight)

    expect(view.getByTestId('near').style.transform).toBe('translate(-5px,-5px)')
    expect(view.getByTestId('far').style.transform).toBe('translate(-24px,-24px)')
  })

  it('drifts the other way once the pointer crosses to the other side', async () => {
    const view = render(<Layers />)

    await moveTo(0, 0)

    expect(view.getByTestId('near').style.transform).toBe('translate(5px,5px)')
  })

  it('ignores the pointer while a layer has not been painted onto the page yet', async () => {
    renderHook(() => useParallax<HTMLDivElement>(nearDepth))

    await expect(moveTo(0, 0)).resolves.not.toThrow()
  })

  it('answers only the last of several moves in one frame, not every one of them', async () => {
    const view = render(<Layers />)

    await act(async () => {
      fireEvent(window, new MouseEvent('mousemove', { clientX: 0, clientY: 0 }))
      fireEvent(window, new MouseEvent('mousemove', { clientX: window.innerWidth, clientY: 0 }))
      await new Promise((painted) => requestAnimationFrame(() => painted(undefined)))
    })

    expect(view.getByTestId('near').style.transform).toBe('translate(-5px,5px)')
  })

  it('holds still for a visitor who asked for less movement', async () => {
    preferStillness(true)
    const view = render(<Layers />)
    const settled = view.getByTestId('near').style.transform

    await moveTo(0, 0)

    expect(view.getByTestId('near').style.transform).toBe(settled)
  })

  it('is already composited before the pointer moves, so nothing repaints on the first move', () => {
    const view = render(<Layers />)

    expect(view.getByTestId('near').style.transform).toBe('translate(0px,0px)')
  })

  it('stops following the pointer once the terminal is gone', async () => {
    const view = render(<Layers />)
    await moveTo(0, 0)
    const layer = view.getByTestId('near')
    view.unmount()

    await moveTo(window.innerWidth, window.innerHeight)

    expect(layer.style.transform).toBe('translate(5px,5px)')
  })
})

import { fireEvent, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { preferStillness } from '@/testing/viewport/viewport'
import { rippleBandPx, rippleLifeMs, rippleRadius } from '@/tty/ripple/ripple'
import { traceLifeMs, traceReachPx } from '@/tty/trail/trail'
import { useDotField } from './use-dot-field'

const painted: { x: number; y: number }[] = []

let nextFrame: FrameRequestCallback | undefined

const Field = (): ReactElement => <canvas ref={useDotField()} />

const withoutACanvasEngine = (): void => {
  painted.length = 0
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    clearRect: () => undefined,
    fillRect: (x: number, y: number, width: number, height: number) =>
      painted.push({ x: x + width / 2, y: y + height / 2 }),
    fillStyle: '',
  } as unknown as CanvasRenderingContext2D)
}

const drawOneFrame = (): void => {
  const frame = nextFrame
  nextFrame = undefined
  frame?.(performance.now())
}

beforeEach(() => {
  vi.useFakeTimers()
  withoutACanvasEngine()
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    nextFrame = callback
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
})

afterEach(() => {
  nextFrame = undefined
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('the dot field under the terminal, disturbed by typing', () => {
  it('lights a ring of dots where a keystroke reached, and nothing beyond it', () => {
    render(<Field />)

    fireEvent.keyDown(window, { key: 'w' })
    vi.advanceTimersByTime(400)
    drawOneFrame()

    const origin = { x: window.innerWidth / 2, y: window.innerHeight / 2, bornAt: 0 }
    const reached = rippleRadius(origin, performance.now())
    const offsets = painted.map(({ x, y }) =>
      Math.abs(Math.hypot(x - origin.x, y - origin.y) - reached),
    )

    expect(painted.length).toBeGreaterThan(0)
    expect(offsets.every((offset) => offset < rippleBandPx)).toBe(true)
  })

  it('settles once the ripple has faded, so an idle page draws nothing', () => {
    render(<Field />)

    fireEvent.keyDown(window, { key: 'w' })
    vi.advanceTimersByTime(rippleLifeMs)
    drawOneFrame()
    painted.length = 0
    drawOneFrame()

    expect(painted).toEqual([])
    expect(nextFrame).toBeUndefined()
  })

  it('stays still for a shortcut, since nothing was typed', () => {
    render(<Field />)

    fireEvent.keyDown(window, { key: 'l', ctrlKey: true })
    drawOneFrame()

    expect(painted).toEqual([])
  })
})

describe('the dot field, for a visitor who asked for less movement', () => {
  it('draws nothing at all, rather than animating out of sight', () => {
    preferStillness(true)
    render(<Field />)

    fireEvent.keyDown(window, { key: 'w' })
    fireEvent.pointerMove(window, { clientX: 300, clientY: 200 })
    drawOneFrame()

    expect(painted).toEqual([])
  })
})

describe('the dot field under the terminal, following the pointer', () => {
  it('lights the dots the pointer is passing over', () => {
    render(<Field />)

    fireEvent.pointerMove(window, { clientX: 300, clientY: 200 })
    drawOneFrame()

    const near = painted.map(({ x, y }) => Math.hypot(x - 300, y - 200))

    expect(painted.length).toBeGreaterThan(0)
    expect(Math.max(...near)).toBeLessThanOrEqual(traceReachPx)
  })

  it('ignores a twitch, so a slow drag does not stack a hundred of them', () => {
    render(<Field />)

    fireEvent.pointerMove(window, { clientX: 300, clientY: 200 })
    drawOneFrame()
    const afterFirst = painted.length
    painted.length = 0

    fireEvent.pointerMove(window, { clientX: 302, clientY: 200 })
    drawOneFrame()

    expect(afterFirst).toBeGreaterThan(0)
    expect(painted.length).toBeLessThanOrEqual(afterFirst)
  })

  it('fades behind the pointer, so the trail does not stay lit', () => {
    render(<Field />)

    fireEvent.pointerMove(window, { clientX: 300, clientY: 200 })
    vi.advanceTimersByTime(traceLifeMs)
    drawOneFrame()
    painted.length = 0
    drawOneFrame()

    expect(painted).toEqual([])
    expect(nextFrame).toBeUndefined()
  })
})

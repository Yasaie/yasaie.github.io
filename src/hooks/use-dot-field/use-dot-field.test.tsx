import { fireEvent, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { withoutACanvasEngine } from '#tests/helpers/canvas'
import { preferStillness } from '#tests/helpers/viewport'
import { rippleBandPx, rippleLifeMs, rippleRadius } from '@/lib/ripple/ripple'
import { traceLifeMs, traceReachPx } from '@/lib/trail/trail'
import { useDotField } from './use-dot-field'

const Field = (): ReactElement => <canvas ref={useDotField()} />

beforeEach(() => vi.useFakeTimers())

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('the dot field under the terminal, disturbed by typing', () => {
  it('lights a ring of dots where a keystroke reached, and nothing beyond it', () => {
    const field = withoutACanvasEngine()
    render(<Field />)

    fireEvent.keyDown(window, { key: 'w' })
    vi.advanceTimersByTime(400)
    field.drawOneFrame()

    const origin = { x: window.innerWidth / 2, y: window.innerHeight / 2, bornAt: 0 }
    const reached = rippleRadius(origin, performance.now())
    const offsets = field.painted.map(({ x, y }) =>
      Math.abs(Math.hypot(x - origin.x, y - origin.y) - reached),
    )

    expect(field.painted.length).toBeGreaterThan(0)
    expect(offsets.every((offset) => offset < rippleBandPx)).toBe(true)
  })

  it('settles once the ripple has faded, so an idle page draws nothing', () => {
    const field = withoutACanvasEngine()
    render(<Field />)

    fireEvent.keyDown(window, { key: 'w' })
    vi.advanceTimersByTime(rippleLifeMs)
    field.drawOneFrame()
    field.painted.length = 0
    field.drawOneFrame()

    expect(field.painted).toEqual([])
    expect(field.isIdle()).toBe(true)
  })

  it('stays still for a shortcut, since nothing was typed', () => {
    const field = withoutACanvasEngine()
    render(<Field />)

    fireEvent.keyDown(window, { key: 'l', ctrlKey: true })
    field.drawOneFrame()

    expect(field.painted).toEqual([])
  })
})

describe('the dot field, for a visitor who asked for less movement', () => {
  it('draws nothing at all, rather than animating out of sight', () => {
    preferStillness(true)
    const field = withoutACanvasEngine()
    render(<Field />)

    fireEvent.keyDown(window, { key: 'w' })
    fireEvent.pointerMove(window, { clientX: 300, clientY: 200 })
    field.drawOneFrame()

    expect(field.painted).toEqual([])
  })
})

describe('the dot field under the terminal, following the pointer', () => {
  it('lights the dots the pointer is passing over', () => {
    const field = withoutACanvasEngine()
    render(<Field />)

    fireEvent.pointerMove(window, { clientX: 300, clientY: 200 })
    field.drawOneFrame()

    const near = field.painted.map(({ x, y }) => Math.hypot(x - 300, y - 200))

    expect(field.painted.length).toBeGreaterThan(0)
    expect(Math.max(...near)).toBeLessThanOrEqual(traceReachPx)
  })

  it('ignores a twitch, so a slow drag does not stack a hundred of them', () => {
    const field = withoutACanvasEngine()
    render(<Field />)

    fireEvent.pointerMove(window, { clientX: 300, clientY: 200 })
    field.drawOneFrame()
    const afterOneMove = [...field.painted]
    field.painted.length = 0

    fireEvent.pointerMove(window, { clientX: 302, clientY: 200 })
    field.drawOneFrame()

    expect(afterOneMove.length).toBeGreaterThan(0)
    expect(field.painted).toEqual(afterOneMove)
  })

  it('fades behind the pointer, so the trail does not stay lit', () => {
    const field = withoutACanvasEngine()
    render(<Field />)

    fireEvent.pointerMove(window, { clientX: 300, clientY: 200 })
    vi.advanceTimersByTime(traceLifeMs)
    field.drawOneFrame()
    field.painted.length = 0
    field.drawOneFrame()

    expect(field.painted).toEqual([])
    expect(field.isIdle()).toBe(true)
  })
})

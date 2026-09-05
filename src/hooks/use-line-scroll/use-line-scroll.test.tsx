import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import { type ReactElement, useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { stepsFrom, useLineScroll } from './use-line-scroll'

const lineHeight = 20

const Scrollback = (): ReactElement => {
  const scroller = useRef<HTMLDivElement | null>(null)
  useLineScroll(scroller)
  return <div data-testid="scrollback" ref={scroller} style={{ lineHeight: `${lineHeight}px` }} />
}

describe('counting a wheel into whole lines', () => {
  it('moves nothing until a whole line has been asked for', () => {
    expect(stepsFrom(0, lineHeight - 1, lineHeight).lines).toBe(0)
  })

  it('carries what is left over, so a slow drag still arrives a line at a time', () => {
    const first = stepsFrom(0, 12, lineHeight)
    const second = stepsFrom(first.carried, 12, lineHeight)

    expect(first.lines).toBe(0)
    expect(second.lines).toBe(1)
    expect(second.carried).toBe(4)
  })

  it('answers a change of direction at once, rather than owing the other way first', () => {
    const down = stepsFrom(0, lineHeight - 2, lineHeight)

    expect(down.lines).toBe(0)
    expect(stepsFrom(down.carried, -lineHeight * 2, lineHeight).lines).toBe(-2)
  })

  it('moves several lines at once when the wheel is spun hard', () => {
    expect(stepsFrom(0, lineHeight * 3, lineHeight).lines).toBe(3)
  })

  it('counts backwards the same way, so scrolling up lands on a line too', () => {
    expect(stepsFrom(0, -lineHeight * 2, lineHeight).lines).toBe(-2)
  })
})

describe('the scrollback under a wheel', () => {
  it('has nothing to bind to before the terminal is on the page', () => {
    expect(() => renderHook(() => useLineScroll({ current: null }))).not.toThrow()
  })

  it('scrolls by whole lines rather than by pixels, the way a terminal does', () => {
    render(<Scrollback />)
    const scrollback = screen.getByTestId('scrollback')

    fireEvent.wheel(scrollback, { deltaY: lineHeight * 2 + 5 })

    expect(scrollback.scrollTop).toBe(lineHeight * 2)
  })
})

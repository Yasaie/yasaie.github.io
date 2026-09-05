import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { useAutoScroll } from './use-auto-scroll'

const scrollbackHeight = 500

const measured = (element: HTMLElement): void => {
  Object.defineProperty(element, 'scrollHeight', { configurable: true, value: scrollbackHeight })
  Object.defineProperty(element, 'clientHeight', { configurable: true, value: 0 })
}

const Scrollback = ({ lines }: { readonly lines: readonly string[] }): ReactElement => {
  const scroller = useAutoScroll<HTMLDivElement>(lines)
  return (
    <div data-testid="scrollback" ref={scroller}>
      {lines.join('\n')}
    </div>
  )
}

describe('a region that prints line after line', () => {
  it('follows the newest line down so the visitor never has to scroll', () => {
    const { rerender } = render(<Scrollback lines={['first']} />)
    const scrollback = screen.getByTestId('scrollback')
    Object.defineProperty(scrollback, 'scrollHeight', {
      configurable: true,
      value: scrollbackHeight,
    })

    rerender(<Scrollback lines={['first', 'second']} />)

    expect(scrollback.scrollTop).toBe(scrollbackHeight)
  })

  it('stops following once the visitor scrolls up, so reading is not interrupted', () => {
    const { rerender } = render(<Scrollback lines={['first']} />)
    const scrollback = screen.getByTestId('scrollback')
    measured(scrollback)

    fireEvent.scroll(scrollback, { target: { scrollTop: 0 } })
    rerender(<Scrollback lines={['first', 'second']} />)

    expect(scrollback.scrollTop).toBe(0)
  })

  it('follows again once the visitor scrolls back to the newest line', () => {
    const { rerender } = render(<Scrollback lines={['first']} />)
    const scrollback = screen.getByTestId('scrollback')
    measured(scrollback)

    fireEvent.scroll(scrollback, { target: { scrollTop: 0 } })
    fireEvent.scroll(scrollback, { target: { scrollTop: scrollbackHeight } })
    rerender(<Scrollback lines={['first', 'second']} />)

    expect(scrollback.scrollTop).toBe(scrollbackHeight)
  })

  it('hands back an empty ref, so a terminal that is not on the page yet scrolls nothing', () => {
    const { result } = renderHook(() => useAutoScroll<HTMLDivElement>([]))
    expect(result.current.current).toBeNull()
  })
})

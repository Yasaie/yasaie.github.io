import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { useSwipeToAccept } from './use-swipe-to-accept'

const accepted: string[] = []

const Screen = (): ReactElement => {
  const swipe = useSwipeToAccept(() => accepted.push('accepted'))
  return <div {...swipe} data-testid="screen" />
}

const touch = (x: number, y: number) => ({ touches: [{ clientX: x, clientY: y }] })

const drag = (from: readonly [number, number], to: readonly [number, number]): void => {
  const screenElement = screen.getByTestId('screen')
  fireEvent.touchStart(screenElement, touch(from[0], from[1]))
  fireEvent.touchMove(screenElement, touch(to[0], to[1]))
  fireEvent.touchEnd(screenElement, touch(to[0], to[1]))
}

const swiped = (from: readonly [number, number], to: readonly [number, number]): number => {
  accepted.length = 0
  render(<Screen />)
  drag(from, to)
  return accepted.length
}

describe('a thumb dragged across the terminal', () => {
  it('takes the suggestion when it travels right, which is what tab does on a keyboard', () => {
    expect(swiped([40, 300], [220, 300])).toBe(1)
  })

  it('leaves the line alone when it travels left, so a stray drag types nothing', () => {
    expect(swiped([220, 300], [40, 300])).toBe(0)
  })

  it('leaves the line alone when it travels down, because that is a visitor scrolling', () => {
    expect(swiped([120, 200], [120, 460])).toBe(0)
  })

  it('leaves the line alone when it barely moves, so a tap is still a tap', () => {
    expect(swiped([120, 300], [140, 300])).toBe(0)
  })
})

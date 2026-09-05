import type { RefObject } from 'react'
import { useIsomorphicLayoutEffect } from 'usehooks-ts'

export type Stepped = {
  readonly lines: number
  readonly carried: number
}

export const stepsFrom = (carried: number, delta: number, lineHeight: number): Stepped => {
  const pending = Math.sign(carried) === Math.sign(delta) ? carried : 0
  const wanted = pending + delta
  const lines = Math.trunc(wanted / lineHeight)
  return { lines, carried: wanted - lines * lineHeight }
}

const lineHeightOf = (element: HTMLElement): number =>
  Number.parseFloat(window.getComputedStyle(element).lineHeight)

export const useLineScroll = <T extends HTMLElement>(scroller: RefObject<T | null>): void => {
  useIsomorphicLayoutEffect(() => {
    const element = scroller.current
    if (element === null) return
    let carried = 0
    const byLine = (event: WheelEvent) => {
      const lineHeight = lineHeightOf(element)
      event.preventDefault()
      const stepped = stepsFrom(carried, event.deltaY, lineHeight)
      carried = stepped.carried
      element.scrollTop += stepped.lines * lineHeight
    }
    element.addEventListener('wheel', byLine, { passive: false })
    return () => element.removeEventListener('wheel', byLine)
  }, [scroller])
}

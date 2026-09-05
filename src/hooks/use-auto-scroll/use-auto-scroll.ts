import { type RefObject, useRef } from 'react'
import { useIsomorphicLayoutEffect } from 'usehooks-ts'

export const useAutoScroll = <T extends HTMLElement>(dependency: unknown): RefObject<T | null> => {
  const scroller = useRef<T | null>(null)

  useIsomorphicLayoutEffect(() => {
    const element = scroller.current
    if (element === null) return
    element.scrollTop = element.scrollHeight
  }, [dependency])

  return scroller
}

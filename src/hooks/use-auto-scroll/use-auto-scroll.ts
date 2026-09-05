import { type RefObject, useRef } from 'react'
import { useIsomorphicLayoutEffect } from 'usehooks-ts'

const withinReach = 32

const atBottom = (element: HTMLElement): boolean =>
  element.scrollHeight - element.scrollTop - element.clientHeight <= withinReach

export const useAutoScroll = <T extends HTMLElement>(
  dependency: readonly unknown[],
): RefObject<T | null> => {
  const scroller = useRef<T | null>(null)
  const following = useRef(true)

  useIsomorphicLayoutEffect(() => {
    const element = scroller.current
    if (element === null || !following.current) return
    element.scrollTop = element.scrollHeight
  }, [dependency])

  useIsomorphicLayoutEffect(() => {
    const element = scroller.current
    if (element === null) return
    const watch = () => {
      following.current = atBottom(element)
    }
    element.addEventListener('scroll', watch, { passive: true })
    return () => element.removeEventListener('scroll', watch)
  }, [])

  return scroller
}

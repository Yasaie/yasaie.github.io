import { type RefObject, useRef } from 'react'
import { useIsomorphicLayoutEffect } from 'usehooks-ts'

const withinReach = 32

const atBottom = (element: HTMLElement): boolean =>
  element.scrollHeight - element.scrollTop - element.clientHeight <= withinReach

export const useAutoScroll = <T extends HTMLElement>(
  printed: readonly unknown[],
  asked: number,
): RefObject<T | null> => {
  const scroller = useRef<T | null>(null)
  const following = useRef(true)

  useIsomorphicLayoutEffect(() => {
    following.current = true
  }, [asked])

  useIsomorphicLayoutEffect(() => {
    const element = scroller.current
    if (element === null || !following.current) return
    element.scrollTop = element.scrollHeight
  }, [printed, asked])

  useIsomorphicLayoutEffect(() => {
    const element = scroller.current
    if (element === null) return
    const taken = () => {
      following.current = false
    }
    const landed = () => {
      if (atBottom(element)) following.current = true
    }
    element.addEventListener('wheel', taken, { passive: true })
    element.addEventListener('touchmove', taken, { passive: true })
    element.addEventListener('scroll', landed, { passive: true })
    return () => {
      element.removeEventListener('wheel', taken)
      element.removeEventListener('touchmove', taken)
      element.removeEventListener('scroll', landed)
    }
  }, [])

  return scroller
}

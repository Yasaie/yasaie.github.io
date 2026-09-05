import { type RefObject, useRef } from 'react'
import { useEventListener } from 'usehooks-ts'

const hitsLink = (event: MouseEvent): boolean =>
  event.target instanceof Element && event.target.closest('a') !== null

const hasSelection = (): boolean => (window.getSelection()?.toString() ?? '') !== ''

export const useClickToFocus = <T extends HTMLElement>(
  target?: RefObject<T | null>,
): RefObject<T | null> => {
  const fallback = useRef<T | null>(null)
  const focusable = target ?? fallback

  useEventListener('click', (event) => {
    const element = focusable.current
    if (element === null || hitsLink(event) || hasSelection()) return
    element.focus()
  })

  return focusable
}

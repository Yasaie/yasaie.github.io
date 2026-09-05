import { type RefObject, useRef } from 'react'
import { useEventListener } from 'usehooks-ts'

const isPrintable = (event: KeyboardEvent): boolean =>
  event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey

export const useTypeToFocus = <T extends HTMLElement>(): RefObject<T | null> => {
  const target = useRef<T | null>(null)

  useEventListener('keydown', (event) => {
    const element = target.current
    if (element === null || document.activeElement === element) return
    if (isPrintable(event)) element.focus()
  })

  return target
}

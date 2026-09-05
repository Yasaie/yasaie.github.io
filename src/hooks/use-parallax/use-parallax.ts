import { type RefObject, useEffect, useRef } from 'react'

type Pointer = { readonly x: number; readonly y: number }

type Layer = (pointer: Pointer) => void

const layers = new Set<Layer>()

const broadcast = (event: MouseEvent): void => {
  const pointer: Pointer = {
    x: event.clientX / window.innerWidth - 0.5,
    y: event.clientY / window.innerHeight - 0.5,
  }
  for (const layer of layers) layer(pointer)
}

const track = (layer: Layer): (() => void) => {
  if (layers.size === 0) window.addEventListener('mousemove', broadcast)
  layers.add(layer)

  return () => {
    layers.delete(layer)
    if (layers.size === 0) window.removeEventListener('mousemove', broadcast)
  }
}

export const useParallax = <T extends HTMLElement>(depth: number): RefObject<T | null> => {
  const layer = useRef<T | null>(null)

  useEffect(
    () =>
      track(({ x, y }) => {
        const element = layer.current
        if (element === null) return
        element.style.transform = `translate(${-x * depth}px,${-y * depth}px)`
      }),
    [depth],
  )

  return layer
}

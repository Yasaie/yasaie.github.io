import { type RefObject, useEffect, useRef } from 'react'
import { useMediaQuery } from 'usehooks-ts'

type Pointer = { readonly x: number; readonly y: number }

type Layer = (pointer: Pointer) => void

const stillness = '(prefers-reduced-motion: reduce)'

const layers = new Set<Layer>()

let queued: number | undefined

const drift = (pointer: Pointer) => () => {
  queued = undefined
  for (const layer of layers) layer(pointer)
}

const broadcast = (event: MouseEvent): void => {
  const pointer: Pointer = {
    x: event.clientX / window.innerWidth - 0.5,
    y: event.clientY / window.innerHeight - 0.5,
  }
  if (queued !== undefined) cancelAnimationFrame(queued)
  queued = requestAnimationFrame(drift(pointer))
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
  const settled = useMediaQuery(stillness)

  useEffect(() => {
    const settledLayer = layer.current
    if (settledLayer !== null) settledLayer.style.transform = 'translate(0px,0px)'
    if (settled) return
    return track(({ x, y }) => {
      const element = layer.current
      if (element === null) return
      element.style.transform = `translate(${-x * depth}px,${-y * depth}px)`
    })
  }, [depth, settled])

  return layer
}

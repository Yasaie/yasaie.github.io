import { type RefObject, useCallback, useEffect, useRef } from 'react'
import { useEventListener } from 'usehooks-ts'
import {
  type Ripple,
  rippleBandPx,
  rippleGlow,
  rippleRadius,
  stillSpreading,
} from '@/tty/ripple/ripple'
import { stillGlowing, type Trace, traceGlow, traceReachPx, worthTracing } from '@/tty/trail/trail'

const gridPx = 28

const dotPx = 1.6

const ink = '255, 176, 32'

const stirredBy = (event: KeyboardEvent): boolean =>
  !event.metaKey && !event.ctrlKey && !event.altKey && event.key !== 'Shift'

const caretCentre = (): { readonly x: number; readonly y: number } => {
  const caret = document.querySelector('[data-caret]')
  if (caret === null) return { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  const box = caret.getBoundingClientRect()
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 }
}

const alignedFrom = (edge: number): number => Math.max(0, Math.floor(edge / gridPx) * gridPx)

const paintAround = (
  brush: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  centre: { readonly x: number; readonly y: number },
  reach: number,
  glowAt: (x: number, y: number) => number,
): void => {
  const right = Math.min(canvas.width, centre.x + reach)
  const bottom = Math.min(canvas.height, centre.y + reach)
  for (let x = alignedFrom(centre.x - reach); x <= right; x += gridPx) {
    for (let y = alignedFrom(centre.y - reach); y <= bottom; y += gridPx) {
      const glow = glowAt(x, y)
      if (glow === 0) continue
      brush.fillStyle = `rgba(${ink}, ${glow})`
      brush.fillRect(x - dotPx / 2, y - dotPx / 2, dotPx, dotPx)
    }
  }
}

export const useDotField = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const ripples = useRef<readonly Ripple[]>([])
  const traces = useRef<readonly Trace[]>([])
  const frame = useRef<number | undefined>(undefined)
  const drawing = useRef(false)

  const draw = useCallback(() => {
    drawing.current = false
    const surface = canvas.current
    const brush = surface?.getContext('2d')
    if (surface === null || brush === null || brush === undefined) return
    const now = performance.now()
    ripples.current = stillSpreading(ripples.current, now)
    traces.current = stillGlowing(traces.current, now)
    brush.clearRect(0, 0, surface.width, surface.height)
    for (const ripple of ripples.current) {
      paintAround(brush, surface, ripple, rippleRadius(ripple, now) + rippleBandPx, (x, y) =>
        rippleGlow(ripple, now, x, y),
      )
    }
    for (const trace of traces.current) {
      paintAround(brush, surface, trace, traceReachPx, (x, y) => traceGlow(trace, now, x, y))
    }
    if (ripples.current.length === 0 && traces.current.length === 0) return
    drawing.current = true
    frame.current = requestAnimationFrame(draw)
  }, [])

  const wake = useCallback(() => {
    if (drawing.current) return
    drawing.current = true
    frame.current = requestAnimationFrame(draw)
  }, [draw])

  const resize = useCallback((surface: HTMLCanvasElement) => {
    if (surface.width === window.innerWidth && surface.height === window.innerHeight) return
    surface.width = window.innerWidth
    surface.height = window.innerHeight
  }, [])

  useEventListener('keydown', (event) => {
    const surface = canvas.current
    if (surface === null || !stirredBy(event)) return
    resize(surface)
    ripples.current = [...ripples.current, { ...caretCentre(), bornAt: performance.now() }]
    wake()
  })

  useEventListener('pointermove', (event) => {
    const surface = canvas.current
    if (surface === null || !worthTracing(traces.current, event.clientX, event.clientY)) return
    resize(surface)
    traces.current = [
      ...traces.current,
      { x: event.clientX, y: event.clientY, bornAt: performance.now() },
    ]
    wake()
  })

  useEffect(
    () => () => {
      if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    },
    [],
  )

  return canvas
}

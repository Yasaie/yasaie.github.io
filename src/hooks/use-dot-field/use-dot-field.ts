import { type RefObject, useCallback, useEffect, useRef } from 'react'
import { useEventListener, useMediaQuery } from 'usehooks-ts'
import {
  type Ripple,
  rippleBandPx,
  rippleGlow,
  rippleRadius,
  stillSpreading,
} from '@/dot-field/ripple/ripple'
import {
  stillGlowing,
  type Trace,
  traceGlow,
  traceReachPx,
  worthTracing,
} from '@/dot-field/trail/trail'

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

type Spread = {
  readonly x: number
  readonly y: number
  readonly reach: number
}

const spreadOf = (ripples: readonly Ripple[], traces: readonly Trace[], now: number): Spread[] => [
  ...ripples.map((ripple) => ({
    x: ripple.x,
    y: ripple.y,
    reach: rippleRadius(ripple, now) + rippleBandPx,
  })),
  ...traces.map((trace) => ({ x: trace.x, y: trace.y, reach: traceReachPx })),
]

const paint = (
  brush: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  ripples: readonly Ripple[],
  traces: readonly Trace[],
  now: number,
): void => {
  brush.clearRect(0, 0, canvas.width, canvas.height)
  const spread = spreadOf(ripples, traces, now)
  if (spread.length === 0) return
  const left = alignedFrom(Math.min(...spread.map((one) => one.x - one.reach)))
  const top = alignedFrom(Math.min(...spread.map((one) => one.y - one.reach)))
  const right = Math.min(canvas.width, Math.max(...spread.map((one) => one.x + one.reach)))
  const bottom = Math.min(canvas.height, Math.max(...spread.map((one) => one.y + one.reach)))
  for (let x = left; x <= right; x += gridPx) {
    for (let y = top; y <= bottom; y += gridPx) {
      let glow = 0
      for (const ripple of ripples) glow = Math.max(glow, rippleGlow(ripple, now, x, y))
      for (const trace of traces) glow = Math.max(glow, traceGlow(trace, now, x, y))
      if (glow === 0) continue
      brush.fillStyle = `rgba(${ink}, ${glow})`
      brush.fillRect(x - dotPx / 2, y - dotPx / 2, dotPx, dotPx)
    }
  }
}

const stillness = '(prefers-reduced-motion: reduce)'

export const useDotField = (): RefObject<HTMLCanvasElement | null> => {
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const settled = useMediaQuery(stillness)
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
    paint(brush, surface, ripples.current, traces.current, now)
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
    if (surface === null || settled || !stirredBy(event)) return
    resize(surface)
    ripples.current = [...ripples.current, { ...caretCentre(), bornAt: performance.now() }]
    wake()
  })

  useEventListener('pointermove', (event) => {
    const surface = canvas.current
    if (surface === null || settled || !worthTracing(traces.current, event.clientX, event.clientY))
      return
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

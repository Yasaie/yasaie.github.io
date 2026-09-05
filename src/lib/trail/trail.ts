export type Trace = {
  readonly x: number
  readonly y: number
  readonly bornAt: number
}

export const traceLifeMs = 700

export const traceReachPx = 46

const traceStepPx = 18

const traceFade = (trace: Trace, now: number): number =>
  Math.max(0, 1 - (now - trace.bornAt) / traceLifeMs) ** 2.4

export const traceGlow = (trace: Trace, now: number, x: number, y: number): number => {
  const distance = Math.hypot(x - trace.x, y - trace.y)
  return distance > traceReachPx ? 0 : (1 - distance / traceReachPx) * traceFade(trace, now)
}

export const stillGlowing = (traces: readonly Trace[], now: number): readonly Trace[] =>
  traces.filter((trace) => traceFade(trace, now) > 0)

export const worthTracing = (traces: readonly Trace[], x: number, y: number): boolean => {
  const last = traces.at(-1)
  return last === undefined || Math.hypot(x - last.x, y - last.y) >= traceStepPx
}

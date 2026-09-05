export type Ripple = {
  readonly x: number
  readonly y: number
  readonly bornAt: number
}

export const rippleLifeMs = 1600

export const rippleBandPx = 26

const speedPxPerMs = 0.5

export const rippleRadius = (ripple: Ripple, now: number): number =>
  (now - ripple.bornAt) * speedPxPerMs

export const rippleFade = (ripple: Ripple, now: number): number =>
  Math.max(0, 1 - (now - ripple.bornAt) / rippleLifeMs)

export const rippleGlow = (ripple: Ripple, now: number, x: number, y: number): number => {
  const offset = Math.abs(Math.hypot(x - ripple.x, y - ripple.y) - rippleRadius(ripple, now))
  return offset > rippleBandPx ? 0 : (1 - offset / rippleBandPx) * rippleFade(ripple, now)
}

export const stillSpreading = (ripples: readonly Ripple[], now: number): readonly Ripple[] =>
  ripples.filter((ripple) => rippleFade(ripple, now) > 0)

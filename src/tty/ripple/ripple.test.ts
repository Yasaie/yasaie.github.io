import { describe, expect, it } from 'vitest'
import { rippleFade, rippleGlow, rippleLifeMs, rippleRadius, stillSpreading } from './ripple'

const struck: Parameters<typeof rippleRadius>[0] = { x: 100, y: 100, bornAt: 0 }

describe('a ripple leaving the caret', () => {
  it('starts where the key was pressed and travels outward from there', () => {
    expect(rippleRadius(struck, 0)).toBe(0)
    expect(rippleRadius(struck, 200)).toBeGreaterThan(rippleRadius(struck, 100))
  })

  it('lights the dots it is passing and leaves the rest of the field alone', () => {
    const reached = rippleRadius(struck, 400)

    expect(rippleGlow(struck, 400, struck.x + reached, struck.y)).toBeGreaterThan(0)
    expect(rippleGlow(struck, 400, struck.x + reached + 200, struck.y)).toBe(0)
    expect(rippleGlow(struck, 400, struck.x, struck.y)).toBe(0)
  })

  it('dims as it goes, so the field settles rather than staying lit', () => {
    const early = rippleGlow(struck, 200, struck.x + rippleRadius(struck, 200), struck.y)
    const late = rippleGlow(struck, 1200, struck.x + rippleRadius(struck, 1200), struck.y)

    expect(late).toBeLessThan(early)
    expect(rippleFade(struck, rippleLifeMs)).toBe(0)
  })

  it('is forgotten once it has faded, so a long session keeps nothing', () => {
    expect(stillSpreading([struck], 100)).toEqual([struck])
    expect(stillSpreading([struck], rippleLifeMs)).toEqual([])
  })
})

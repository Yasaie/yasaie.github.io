import { describe, expect, it } from 'vitest'
import { stillGlowing, traceGlow, traceLifeMs, traceReachPx, worthTracing } from './trail'

const passed = { x: 200, y: 200, bornAt: 0 }

describe('a trace the pointer leaves in the field', () => {
  it('lights the dots it passed over and nothing further out', () => {
    expect(traceGlow(passed, 0, passed.x, passed.y)).toBeGreaterThan(0)
    expect(traceGlow(passed, 0, passed.x + traceReachPx + 1, passed.y)).toBe(0)
  })

  it('is brightest under the pointer and dims outward, so the trail has a shape', () => {
    expect(traceGlow(passed, 0, passed.x, passed.y)).toBeGreaterThan(
      traceGlow(passed, 0, passed.x + traceReachPx / 2, passed.y),
    )
  })

  it('fades behind the pointer rather than staying lit', () => {
    expect(traceGlow(passed, traceLifeMs / 2, passed.x, passed.y)).toBeLessThan(
      traceGlow(passed, 0, passed.x, passed.y),
    )
    expect(stillGlowing([passed], traceLifeMs)).toEqual([])
  })

  it('records the first move, then only moves worth recording', () => {
    expect(worthTracing([], 10, 10)).toBe(true)
    expect(worthTracing([passed], passed.x + 1, passed.y)).toBe(false)
    expect(worthTracing([passed], passed.x + traceReachPx, passed.y)).toBe(true)
  })
})

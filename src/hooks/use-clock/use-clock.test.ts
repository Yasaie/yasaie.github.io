import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useClock } from './use-clock'

afterEach(() => vi.useRealTimers())

const frozenAt = (moment: string): void => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(moment))
}

describe('the clock in the title bar', () => {
  it('shows the time in Amsterdam rather than wherever the visitor is', () => {
    frozenAt('2026-01-01T23:05:00Z')
    expect(renderHook(() => useClock()).result.current).toBe('00:05 CET')
  })

  it('follows Amsterdam into summer time, naming the zone it is actually in', () => {
    frozenAt('2026-07-01T12:00:00Z')
    expect(renderHook(() => useClock()).result.current).toBe('14:00 CEST')
  })

  it('reads midnight as 00, never as 24', () => {
    frozenAt('2026-01-01T23:30:00Z')
    expect(renderHook(() => useClock()).result.current).toBe('00:30 CET')
  })

  it('keeps up as the minutes pass', () => {
    frozenAt('2026-01-01T12:00:00Z')
    const { result } = renderHook(() => useClock())
    expect(result.current).toBe('13:00 CET')
    act(() => {
      vi.setSystemTime(new Date('2026-01-01T12:01:00Z'))
      vi.advanceTimersByTime(10_000)
    })
    expect(result.current).toBe('13:01 CET')
  })
})

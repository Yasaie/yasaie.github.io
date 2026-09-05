import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Action } from '@/session/actions/actions'
import { scheduleConsumed } from '@/session/actions/actions'
import type { Scheduled, TerminalState } from '@/session/state/state'
import { createSession } from '@/session/state/state'
import { mountRealDisk } from '@/testing/disk/disk'
import { useScheduledEffects } from './use-scheduled-effects'

const volume = await mountRealDisk()

const replay: Scheduled = { kind: 'reboot', delayMs: 1400 }
const congratulate: Scheduled = { kind: 'reward', delayMs: 600 }

const session = (scheduled: readonly Scheduled[]): TerminalState => ({
  ...createSession(volume),
  queue: [],
  scheduled,
})

const waiting = (scheduled: readonly Scheduled[]) => {
  const consumed: Action[] = []
  const view = renderHook(
    ({ state }) => useScheduledEffects(state, (action) => consumed.push(action)),
    { initialProps: { state: session(scheduled) } },
  )
  return { consumed, view }
}

beforeEach(() => vi.useFakeTimers())

afterEach(() => vi.useRealTimers())

describe('an effect the session asked for later', () => {
  it('happens once its delay has passed, and tells the session it happened', () => {
    const { consumed } = waiting([replay])

    vi.advanceTimersByTime(1399)
    expect(consumed).toEqual([])

    vi.advanceTimersByTime(1)
    expect(consumed).toEqual([scheduleConsumed(replay)])
  })

  it('is armed once, however often the screen redraws while it waits', () => {
    const { consumed, view } = waiting([replay])

    view.rerender({ state: session([replay]) })
    view.rerender({ state: session([replay]) })
    vi.advanceTimersByTime(5000)

    expect(consumed).toEqual([scheduleConsumed(replay)])
  })

  it('waits its own delay alongside an effect of another kind', () => {
    const { consumed } = waiting([replay, congratulate])

    vi.advanceTimersByTime(600)
    expect(consumed).toEqual([scheduleConsumed(congratulate)])

    vi.advanceTimersByTime(800)
    expect(consumed).toEqual([scheduleConsumed(congratulate), scheduleConsumed(replay)])
  })

  it('is called off when the session stops asking for it', () => {
    const { consumed, view } = waiting([replay])

    view.rerender({ state: session([]) })
    vi.advanceTimersByTime(5000)

    expect(consumed).toEqual([])
  })

  it('never fires after the terminal has left the page', () => {
    const { consumed, view } = waiting([replay])

    view.unmount()
    vi.advanceTimersByTime(5000)

    expect(consumed).toEqual([])
  })
})

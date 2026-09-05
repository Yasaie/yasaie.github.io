import { type Dispatch, useEffect, useRef } from 'react'
import { type Action, scheduleConsumed } from '@/session/actions/actions'
import type { Scheduled, TerminalState } from '@/session/state/state'

type Armed = Map<Scheduled['kind'], number>

export const useScheduledEffects = (state: TerminalState, dispatch: Dispatch<Action>): void => {
  const timers = useRef<Armed>(new Map())
  const scheduled = state.scheduled

  useEffect(() => {
    const armed = timers.current

    for (const entry of scheduled) {
      if (armed.has(entry.kind)) continue
      const timer = window.setTimeout(() => {
        armed.delete(entry.kind)
        dispatch(scheduleConsumed(entry))
      }, entry.delayMs)
      armed.set(entry.kind, timer)
    }

    for (const [kind, timer] of armed) {
      if (scheduled.some((entry) => entry.kind === kind)) continue
      window.clearTimeout(timer)
      armed.delete(kind)
    }
  }, [scheduled, dispatch])

  useEffect(() => {
    const armed = timers.current
    return () => {
      for (const timer of armed.values()) window.clearTimeout(timer)
      armed.clear()
    }
  }, [])
}

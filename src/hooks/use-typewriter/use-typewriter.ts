import { type Dispatch, useEffect } from 'react'
import { type Action, lineDrained } from '@/session/actions/actions'
import { nextDelayMs } from '@/session/selectors/selectors'
import type { TerminalState } from '@/session/state/state'

export const useTypewriter = (state: TerminalState, dispatch: Dispatch<Action>): void => {
  const [pending] = state.queue
  const delayMs = nextDelayMs(state)

  useEffect(() => {
    if (pending === undefined) return
    const timer = window.setTimeout(() => dispatch(lineDrained()), delayMs)
    return () => window.clearTimeout(timer)
  }, [pending, delayMs, dispatch])
}

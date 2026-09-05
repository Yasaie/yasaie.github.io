import { type Dispatch, useMemo, useReducer } from 'react'
import type { Volume } from '@/fs/volume/volume'
import { useNarrowLayout } from '@/hooks/use-narrow-layout/use-narrow-layout'
import { useScheduledEffects } from '@/hooks/use-scheduled-effects/use-scheduled-effects'
import { useTypewriter } from '@/hooks/use-typewriter/use-typewriter'
import type { Action } from '@/session/actions/actions'
import { sessionReducer } from '@/session/reducer/reducer'
import { ghostText, statusLine, suggestion } from '@/session/selectors/selectors'
import { createSession, type TerminalState } from '@/session/state/state'

export type Terminal = {
  readonly state: TerminalState
  readonly dispatch: Dispatch<Action>
  readonly suggestion: string
  readonly ghost: string
  readonly statusLine: string
  readonly isNarrow: boolean
}

export const useTerminal = (volume: Volume): Terminal => {
  const reducer = useMemo(() => sessionReducer(volume), [volume])
  const [state, dispatch] = useReducer(reducer, volume, createSession)
  const isNarrow = useNarrowLayout()

  useTypewriter(state, dispatch)
  useScheduledEffects(state, dispatch)

  return {
    state,
    dispatch,
    suggestion: suggestion(state),
    ghost: ghostText(state),
    statusLine: statusLine(state, !isNarrow),
    isNarrow,
  }
}

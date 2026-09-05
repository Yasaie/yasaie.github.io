import { foundCount, totalCounted } from '@/session/progress/progress'
import type { TerminalState } from '@/session/state/state'
import { ghost, suggest } from '@/session/suggest/suggest'
import type { Line } from '@/tty/line/line'

const tabHint = 'tab ↹ · '

const isBlank = (line: Line): boolean => {
  switch (line.kind) {
    case 'plain':
      return line.row.segments.every((part) => part.text === '')
    case 'responsive':
      return false
    case 'wordmark':
      return false
  }
}

export const suggestion = (state: TerminalState): string => suggest(state)

export const ghostText = (state: TerminalState): string => ghost(state)

export const prompt = (state: TerminalState): string => `payam@yasaie ${state.cwd} $`

export const progressLabel = (state: TerminalState): string =>
  `${foundCount(state.discovered)}/${totalCounted}`

export const statusLine = (state: TerminalState, wide: boolean): string =>
  wide && suggestion(state) !== '' ? `${tabHint}${progressLabel(state)}` : progressLabel(state)

export const nextDelayMs = (state: TerminalState): number => {
  const [next] = state.queue
  return next === undefined || isBlank(next.line) ? 0 : next.speedMs
}

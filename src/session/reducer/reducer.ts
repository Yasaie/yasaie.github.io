import type { Volume } from '@/fs/volume/volume'
import type { Effect, EffectHandlers } from '@/kernel/effects/effects'
import { applyEffect } from '@/kernel/effects/effects'
import { execute } from '@/kernel/execute/execute'
import { parse } from '@/kernel/parse/parse'
import type { Action } from '@/session/actions/actions'
import type { HistoryMove } from '@/session/history/history'
import { noHistoryIndex, pushHistory, stepBack, stepForward } from '@/session/history/history'
import { recordDiscovery } from '@/session/progress/progress'
import { prompt, suggestion } from '@/session/selectors/selectors'
import type { Scheduled, TerminalState } from '@/session/state/state'
import {
  bootSequence,
  homeDirectory,
  outputSpeedMs,
  queuedLines,
  rewardDelayMs,
  rewardSequence,
  scrollbackLimit,
} from '@/session/state/state'
import { blank, text } from '@/tty/line/line'
import type { Colour } from '@/tty/palette/palette'

export type SessionReducer = (state: TerminalState, action: Action) => TerminalState

const echoColour: Colour = 'faint'

const rewardScheduled: Scheduled = { kind: 'reward', delayMs: rewardDelayMs }

const queueFlushedBy: Readonly<Record<Effect['kind'], boolean>> = Object.freeze({
  clear: true,
  changeDirectory: false,
  reboot: true,
  delegate: false,
})

const credit = (state: TerminalState, command: string): TerminalState => {
  const { discovered, completed } = recordDiscovery(state.discovered, command)
  return {
    ...state,
    discovered,
    scheduled: completed ? [...state.scheduled, rewardScheduled] : state.scheduled,
  }
}

const handlersFor = (state: TerminalState): EffectHandlers<TerminalState> => ({
  clear: () => ({ ...state, lines: [], queue: [] }),
  changeDirectory: ({ cwd }) => ({ ...state, cwd }),
  reboot: ({ delayMs }) => ({
    ...state,
    scheduled: [...state.scheduled, { kind: 'reboot', delayMs }],
  }),
  delegate: ({ name }) => credit(state, name),
})

const applyEffects = (state: TerminalState, effects: readonly Effect[]): TerminalState =>
  effects.reduce((carried, effect) => applyEffect(handlersFor(carried), effect), state)

const submit = (volume: Volume, state: TerminalState): TerminalState => {
  const parsed = parse(state.typed, state.cwd)
  if (parsed.kind === 'blank') return state
  const { invocation } = parsed
  const output = execute(invocation, volume)
  const echo = text(`${prompt(state)} ${invocation.raw}`, echoColour)
  const kept = output.effects.some((effect) => queueFlushedBy[effect.kind]) ? [] : state.queue
  const printed = queuedLines([echo, ...output.lines, blank], output.speedMs ?? outputSpeedMs)
  const applied = applyEffects({ ...state, queue: [...kept, ...printed] }, output.effects)
  return {
    ...credit(applied, invocation.name),
    typed: '',
    caret: 0,
    history: pushHistory(state.history, invocation.raw),
    historyIndex: noHistoryIndex,
  }
}

const boot = (volume: Volume, state: TerminalState): TerminalState => ({
  ...state,
  lines: [],
  queue: bootSequence(volume),
  cwd: homeDirectory,
})

const withoutScheduled = (
  scheduled: readonly Scheduled[],
  kind: Scheduled['kind'],
): readonly Scheduled[] => {
  const position = scheduled.findIndex((entry) => entry.kind === kind)
  return position === -1
    ? scheduled
    : [...scheduled.slice(0, position), ...scheduled.slice(position + 1)]
}

const consume = (volume: Volume, state: TerminalState, target: Scheduled): TerminalState => {
  const scheduled = withoutScheduled(state.scheduled, target.kind)
  switch (target.kind) {
    case 'reboot':
      return { ...boot(volume, state), scheduled }
    case 'reward':
      return { ...state, scheduled, queue: [...state.queue, ...rewardSequence] }
  }
}

const move = (state: TerminalState, moved: HistoryMove): TerminalState => {
  switch (moved.kind) {
    case 'unchanged':
      return state
    case 'moved':
      return { ...state, historyIndex: moved.index, typed: moved.entry, caret: moved.caret }
  }
}

const accept = (state: TerminalState): TerminalState => {
  const accepted = suggestion(state)
  return accepted === '' ? state : { ...state, typed: accepted, caret: accepted.length }
}

const drain = (state: TerminalState): TerminalState => {
  const [next, ...queue] = state.queue
  return next === undefined
    ? state
    : { ...state, lines: [...state.lines, next.line].slice(-scrollbackLimit), queue }
}

export const sessionReducer =
  (volume: Volume): SessionReducer =>
  (state, action) => {
    switch (action.kind) {
      case 'typed':
        return { ...state, typed: action.value, caret: action.caret }
      case 'caretMoved':
        return { ...state, caret: action.caret }
      case 'submitted':
        return submit(volume, state)
      case 'historyBack':
        return move(state, stepBack(state.history, state.historyIndex))
      case 'historyForward':
        return move(state, stepForward(state.history, state.historyIndex))
      case 'suggestionAccepted':
        return accept(state)
      case 'lineDrained':
        return drain(state)
      case 'focusChanged':
        return { ...state, focused: action.focused }
      case 'cleared':
        return { ...state, lines: [], queue: [] }
      case 'scheduleConsumed':
        return consume(volume, state, action.scheduled)
    }
  }

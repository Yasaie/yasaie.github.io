import { describe, expect, it } from 'vitest'
import {
  caretMoved,
  cleared,
  focusChanged,
  historyBack,
  historyForward,
  lineDrained,
  scheduleConsumed,
  submitted,
  suggestionAccepted,
  typed,
} from './actions'

describe('what the prompt can tell the session', () => {
  it('carries the line and the caret whenever either of them changes', () => {
    expect(typed('work 2', 6)).toEqual({ kind: 'typed', value: 'work 2', caret: 6 })
    expect(caretMoved(2)).toEqual({ kind: 'caretMoved', caret: 2 })
  })

  it('names the keystrokes that do more than type a letter', () => {
    expect(submitted()).toEqual({ kind: 'submitted' })
    expect(suggestionAccepted()).toEqual({ kind: 'suggestionAccepted' })
    expect(historyBack()).toEqual({ kind: 'historyBack' })
    expect(historyForward()).toEqual({ kind: 'historyForward' })
    expect(cleared()).toEqual({ kind: 'cleared' })
  })

  it('says whether the visitor is still looking at the prompt', () => {
    expect(focusChanged(true)).toEqual({ kind: 'focusChanged', focused: true })
    expect(focusChanged(false)).toEqual({ kind: 'focusChanged', focused: false })
  })
})

describe('what the host can tell the session', () => {
  it('reports each line it has finished printing', () => {
    expect(lineDrained()).toEqual({ kind: 'lineDrained' })
  })

  it('hands back the delayed effect it was asked to wait out', () => {
    expect(scheduleConsumed({ kind: 'reboot', delayMs: 1400 })).toEqual({
      kind: 'scheduleConsumed',
      scheduled: { kind: 'reboot', delayMs: 1400 },
    })
  })
})

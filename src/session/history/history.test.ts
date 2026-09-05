import { describe, expect, it } from 'vitest'
import { historyLimit, noHistoryIndex, pushHistory, stepBack, stepForward } from './history'

describe('command history', () => {
  it('puts the newest command first so the first press of up reaches it', () => {
    expect(pushHistory(['whoami'], 'stack')).toEqual(['stack', 'whoami'])
  })

  it('keeps a command that was run twice in a row, as a shell does', () => {
    expect(pushHistory(['ls'], 'ls')).toEqual(['ls', 'ls'])
  })

  it('remembers at most fifty commands and forgets the oldest first', () => {
    const full = Array.from({ length: historyLimit }, (_, position) => `work ${position}`)
    const pushed = pushHistory(full, 'stack')
    expect(pushed).toHaveLength(historyLimit)
    expect(pushed.at(0)).toBe('stack')
    expect(pushed.at(-1)).toBe('work 48')
  })
})

describe('walking back through history', () => {
  it('offers the most recent command with the caret at its end', () => {
    expect(stepBack(['work 2', 'whoami'], noHistoryIndex)).toEqual({
      kind: 'moved',
      index: 0,
      entry: 'work 2',
      caret: 6,
    })
  })

  it('stops at the oldest command rather than running off the end', () => {
    expect(stepBack(['work 2', 'whoami'], 1)).toEqual({
      kind: 'moved',
      index: 1,
      entry: 'whoami',
      caret: 6,
    })
  })

  it('leaves the input alone when nothing has been typed yet', () => {
    expect(stepBack([], noHistoryIndex)).toEqual({ kind: 'unchanged' })
  })
})

describe('walking forward through history', () => {
  it('returns towards the newest command', () => {
    expect(stepForward(['work 2', 'whoami'], 1)).toEqual({
      kind: 'moved',
      index: 0,
      entry: 'work 2',
      caret: 6,
    })
  })

  it('empties the input when it walks past the newest command', () => {
    expect(stepForward(['whoami'], 0)).toEqual({
      kind: 'moved',
      index: noHistoryIndex,
      entry: '',
      caret: 0,
    })
  })

  it('stays empty when it is already past the newest command', () => {
    expect(stepForward(['whoami'], noHistoryIndex)).toEqual({
      kind: 'moved',
      index: noHistoryIndex,
      entry: '',
      caret: 0,
    })
  })
})

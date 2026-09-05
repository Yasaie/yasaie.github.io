import { describe, expect, it } from 'vitest'
import { ghost, suggest, suggestionOrder } from './suggest'

const nothingTyped = { typed: '', history: [], discovered: [] }

describe('suggesting a command for an empty prompt', () => {
  it('offers the first command the visitor has not run yet', () => {
    expect(suggest(nothingTyped)).toBe('whoami')
    expect(suggest({ ...nothingTyped, discovered: ['whoami', 'work'] })).toBe('stack')
  })

  it('offers nothing once every command it points at has been run', () => {
    expect(suggest({ ...nothingTyped, discovered: suggestionOrder })).toBe('')
  })

  it('points only at the commands that lead somewhere, never at the housekeeping ones', () => {
    expect(suggestionOrder).not.toContain('help')
    expect(suggestionOrder).not.toContain('clear')
  })
})

describe('suggesting a command from what has been typed', () => {
  it('completes a command from its opening letters', () => {
    expect(suggest({ ...nothingTyped, typed: 'sta' })).toBe('stack')
  })

  it('prefers something the visitor has run before over the standard list', () => {
    expect(suggest({ ...nothingTyped, typed: 'w', history: ['work 2'] })).toBe('work 2')
  })

  it('ignores history that has nothing to do with what is being typed', () => {
    expect(suggest({ ...nothingTyped, typed: 'wh', history: ['ls -la'] })).toBe('whoami')
  })

  it('completes regardless of the case the visitor types in', () => {
    expect(suggest({ ...nothingTyped, typed: 'STA' })).toBe('stack')
  })

  it('suggests the first chapter once work has been typed with a space', () => {
    expect(suggest({ ...nothingTyped, typed: 'work ' })).toBe('work 1')
  })

  it('has nothing to add to a command that is already complete', () => {
    expect(suggest({ ...nothingTyped, typed: 'work' })).toBe('')
  })

  it('stays quiet rather than guessing at something it does not know', () => {
    expect(suggest({ ...nothingTyped, typed: 'zzz' })).toBe('')
  })
})

describe('the grey remainder shown after the caret', () => {
  it('shows only the part of the suggestion still to be typed', () => {
    expect(ghost({ ...nothingTyped, typed: 'sta', caret: 3 })).toBe('ck')
  })

  it('shows the whole suggested command when nothing has been typed', () => {
    expect(ghost({ ...nothingTyped, caret: 0 })).toBe('whoami')
  })

  it('disappears while the caret sits back inside the line, where it would mislead', () => {
    expect(ghost({ ...nothingTyped, typed: 'sta', caret: 1 })).toBe('')
  })

  it('keeps the letters the visitor typed, whatever case they used', () => {
    expect(ghost({ ...nothingTyped, typed: 'STA', caret: 3 })).toBe('ck')
  })

  it('shows nothing when there is no suggestion to extend the line with', () => {
    expect(ghost({ ...nothingTyped, typed: 'zzz', caret: 3 })).toBe('')
  })
})

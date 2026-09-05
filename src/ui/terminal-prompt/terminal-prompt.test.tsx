import { fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { describe, expect, it } from 'vitest'
import type { Terminal } from '@/hooks/use-terminal/use-terminal'
import type { Action } from '@/session/actions/actions'
import {
  caretMoved,
  cleared,
  focusChanged,
  historyBack,
  historyForward,
  submitted,
  suggestionAccepted,
  typed,
} from '@/session/actions/actions'
import type { TerminalState } from '@/session/state/state'
import { TerminalPrompt } from './terminal-prompt'

const idle: TerminalState = {
  typed: '',
  caret: 0,
  lines: [],
  queue: [],
  history: [],
  historyIndex: -1,
  discovered: [],
  cwd: '~',
  focused: false,
  scheduled: [],
}

const prompt = (over: Partial<Terminal> = {}) => {
  const dispatched: Action[] = []
  const terminal: Terminal = {
    state: idle,
    dispatch: (action) => {
      dispatched.push(action)
    },
    suggestion: '',
    ghost: '',
    statusLine: '0/9',
    isNarrow: false,
    ...over,
  }
  render(<TerminalPrompt terminal={terminal} inputRef={createRef<HTMLInputElement>()} />)
  const field = screen.getByLabelText<HTMLInputElement>('command')
  return { dispatched, field }
}

const typing = (line: string, caret: number, suggestion = ''): Partial<Terminal> => ({
  state: { ...idle, typed: line, caret },
  suggestion,
  ghost: suggestion.slice(line.length),
})

describe('the prompt line', () => {
  it('names the machine, the directory and the dollar the visitor types after', () => {
    prompt({ state: { ...idle, cwd: '~/work' } })
    expect(screen.getByText('payam@yasaie')).toBeInTheDocument()
    expect(screen.getByText('~/work')).toBeInTheDocument()
    expect(screen.getByText('$')).toBeInTheDocument()
  })

  it('offers a real input, so any keyboard and any assistive tool can reach it', () => {
    const { field } = prompt()
    expect(field.tagName).toBe('INPUT')
    expect(field).toHaveAttribute('autocomplete', 'off')
    expect(field).toHaveAttribute('spellcheck', 'false')
  })

  it('shows how far through the game the visitor is', () => {
    prompt({ statusLine: 'tab ↹ · 3/9' })
    expect(screen.getByText('tab ↹ · 3/9')).toBeInTheDocument()
  })

  it('shows the rest of the suggested command in grey behind the line', () => {
    prompt(typing('sta', 3, 'stack'))
    expect(screen.getByText('ck')).toBeInTheDocument()
  })
})

describe('what the keys do at the prompt', () => {
  it('runs the line when the visitor presses enter', () => {
    const { dispatched, field } = prompt(typing('whoami', 6))
    fireEvent.keyDown(field, { key: 'Enter' })
    expect(dispatched).toEqual([submitted()])
  })

  it('accepts the suggestion on tab', () => {
    const { dispatched, field } = prompt(typing('sta', 3, 'stack'))
    expect(fireEvent.keyDown(field, { key: 'Tab' })).toBe(false)
    expect(dispatched).toEqual([suggestionAccepted()])
  })

  it('lets tab move on as usual when there is nothing to accept', () => {
    const { dispatched, field } = prompt(typing('zzz', 3))
    expect(fireEvent.keyDown(field, { key: 'Tab' })).toBe(true)
    expect(dispatched).toEqual([])
  })

  it('accepts the suggestion with the right arrow at the end of the line', () => {
    const { dispatched, field } = prompt(typing('sta', 3, 'stack'))
    field.setSelectionRange(3, 3)
    fireEvent.keyDown(field, { key: 'ArrowRight' })
    expect(dispatched).toEqual([suggestionAccepted()])
  })

  it('leaves the right arrow to move the caret while it sits inside the line', () => {
    const { dispatched, field } = prompt(typing('sta', 1, 'stack'))
    field.setSelectionRange(1, 1)
    expect(fireEvent.keyDown(field, { key: 'ArrowRight' })).toBe(true)
    expect(dispatched).toEqual([])
  })

  it('walks back and forward through the commands already run', () => {
    const { dispatched, field } = prompt()
    fireEvent.keyDown(field, { key: 'ArrowUp' })
    fireEvent.keyDown(field, { key: 'ArrowDown' })
    expect(dispatched).toEqual([historyBack(), historyForward()])
  })

  it('wipes the screen on ctrl+l', () => {
    const { dispatched, field } = prompt()
    expect(fireEvent.keyDown(field, { key: 'l', ctrlKey: true })).toBe(false)
    expect(dispatched).toEqual([cleared()])
  })

  it('types an ordinary l when it is pressed on its own', () => {
    const { dispatched, field } = prompt()
    expect(fireEvent.keyDown(field, { key: 'l' })).toBe(true)
    expect(dispatched).toEqual([])
  })

  it('lets every other key through untouched', () => {
    const { dispatched, field } = prompt()
    expect(fireEvent.keyDown(field, { key: 'Escape' })).toBe(true)
    expect(dispatched).toEqual([])
  })
})

describe('what the prompt reports back', () => {
  it('tells the session what was typed and where the caret ended up', () => {
    const { dispatched, field } = prompt()
    fireEvent.change(field, { target: { value: 'wor' } })
    expect(dispatched).toEqual([typed('wor', 3)])
  })

  it('tells the session when the caret is moved by hand', () => {
    const { dispatched, field } = prompt(typing('whoami', 6))
    field.setSelectionRange(2, 2)
    fireEvent.click(field)
    expect(dispatched).toEqual([caretMoved(2)])
  })

  it('says nothing when a click leaves the caret where it already was', () => {
    const { dispatched, field } = prompt(typing('whoami', 6))
    field.setSelectionRange(6, 6)
    fireEvent.click(field)
    expect(dispatched).toEqual([])
  })

  it('reports focus and blur, so the block cursor can dim', () => {
    const { dispatched, field } = prompt()
    fireEvent.focus(field)
    fireEvent.blur(field)
    expect(dispatched).toEqual([focusChanged(true), focusChanged(false)])
  })
})

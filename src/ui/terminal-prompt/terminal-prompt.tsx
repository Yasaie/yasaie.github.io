import type { KeyboardEvent, ReactElement, RefObject, SyntheticEvent } from 'react'
import type { Terminal } from '@/hooks/use-terminal/use-terminal'
import {
  type Action,
  caretMoved,
  cleared,
  focusChanged,
  historyBack,
  historyForward,
  submitted,
  suggestionAccepted,
  typed,
} from '@/session/actions/actions'
import { PromptGhost } from '@/ui/prompt-ghost/prompt-ghost'
import { PromptStatus } from '@/ui/prompt-status/prompt-status'

type Keystroke = {
  readonly suggestion: string
  readonly atEnd: boolean
  readonly ctrl: boolean
}

const accept = ({ suggestion }: Keystroke): Action | undefined =>
  suggestion === '' ? undefined : suggestionAccepted()

const bindings: Readonly<Record<string, (stroke: Keystroke) => Action | undefined>> = Object.freeze(
  {
    Enter: () => submitted(),
    Tab: accept,
    ArrowRight: (stroke) => (stroke.atEnd ? accept(stroke) : undefined),
    ArrowUp: () => historyBack(),
    ArrowDown: () => historyForward(),
    l: ({ ctrl }) => (ctrl ? cleared() : undefined),
  },
)

const caretIn = (field: HTMLInputElement): number => field.selectionStart ?? field.value.length

const inputLabel = 'command'

export type TerminalPromptProps = {
  readonly terminal: Terminal
  readonly inputRef: RefObject<HTMLInputElement | null>
}

export const TerminalPrompt = ({ terminal, inputRef }: TerminalPromptProps): ReactElement => {
  const { state, dispatch } = terminal

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    const binding = bindings[event.key]
    if (binding === undefined) return
    const action = binding({
      suggestion: terminal.suggestion,
      atEnd: caretIn(event.currentTarget) === state.typed.length,
      ctrl: event.ctrlKey,
    })
    if (action === undefined) return
    event.preventDefault()
    dispatch(action)
  }

  const onCaretMoved = (event: SyntheticEvent<HTMLInputElement>): void => {
    const caret = caretIn(event.currentTarget)
    if (caret !== state.caret) dispatch(caretMoved(caret))
  }

  return (
    <div className="pt-2 pb-7">
      <div className="flex items-center gap-2.5">
        <span className="text-terminal-accent">payam@yasaie</span>
        <span className="text-terminal-faint">{state.cwd}</span>
        <span className="text-terminal-text">$</span>
        <div className="relative min-w-0 flex-1">
          <PromptGhost
            beforeCaret={state.typed.slice(0, Math.min(state.caret, state.typed.length))}
            ghost={terminal.ghost}
            focused={state.focused}
          />
          <input
            ref={inputRef}
            aria-label={inputLabel}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="w-full border-0 bg-transparent p-0 text-terminal-text caret-transparent outline-none"
            enterKeyHint="go"
            onBlur={() => dispatch(focusChanged(false))}
            onChange={(event) => dispatch(typed(event.target.value, caretIn(event.target)))}
            onClick={onCaretMoved}
            onFocus={() => dispatch(focusChanged(true))}
            onKeyDown={onKeyDown}
            onKeyUp={onCaretMoved}
            onSelect={onCaretMoved}
            spellCheck={false}
            value={state.typed}
          />
        </div>
        <PromptStatus label={terminal.statusLine} />
      </div>
    </div>
  )
}

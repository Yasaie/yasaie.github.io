import { describe, expect, it } from 'vitest'
import { mountRealDisk } from '@/testing/disk/disk'
import { screenColours, screenText } from '@/testing/screen/screen'
import { text } from '@/tty/line/line'
import type { Action } from '../actions/actions'
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
} from '../actions/actions'
import { createSession, queuedLines, type TerminalState } from '../state/state'
import { sessionReducer } from './reducer'

const volume = await mountRealDisk()

const reduce = sessionReducer(volume)

const dispatched = (state: TerminalState, ...actions: readonly Action[]): TerminalState =>
  actions.reduce(reduce, state)

const drained = (state: TerminalState): TerminalState =>
  state.queue.length === 0 ? state : drained(reduce(state, lineDrained()))

const booted = drained(createSession(volume))

const run = (state: TerminalState, line: string): TerminalState =>
  drained(dispatched(state, typed(line, line.length), submitted()))

const printedBy = (before: TerminalState, now: TerminalState): readonly string[] =>
  screenText(now.lines.slice(before.lines.length))

describe('running a command', () => {
  it('echoes the line, prints the answer under it and leaves a blank line before the next prompt', () => {
    const printed = printedBy(booted, run(booted, 'whoami'))
    expect(printed.at(0)).toBe('payam@yasaie ~ $ whoami')
    expect(printed).toContain('Payam Yasaie')
    expect(printed.at(-1)).toBe('')
  })

  it('greys the echo so it reads as something already said, not as an answer', () => {
    const printed = screenColours(run(booted, 'whoami').lines.slice(booted.lines.length))
    expect(printed.at(0)).toEqual(['faint'])
  })

  it('echoes the line exactly as it was typed, not as the machine parsed it', () => {
    expect(printedBy(booted, run(booted, 'CAT  ../whoami')).at(0)).toBe(
      'payam@yasaie ~ $ CAT  ../whoami',
    )
  })

  it('clears the prompt and lets the next command be typed', () => {
    const answered = run(booted, 'whoami')
    expect(answered.typed).toBe('')
    expect(answered.caret).toBe(0)
  })

  it('ignores an empty line, as a shell does', () => {
    const nothing = dispatched(booted, typed('   ', 3), submitted())
    expect(nothing.lines).toEqual(booted.lines)
    expect(nothing.queue).toEqual([])
    expect(nothing.history).toEqual([])
  })

  it('says a command that is not installed is not installed, without crediting it', () => {
    const missing = run(booted, 'sl')
    expect(printedBy(booted, missing).at(1)).toBe('zsh: command not found: sl')
    expect(missing.discovered).toEqual([])
  })
})

describe('clearing the screen', () => {
  it('leaves nothing printed and nothing waiting, not even its own echo', () => {
    const wiped = dispatched(createSession(volume), typed('clear', 5), submitted())
    expect(wiped.lines).toEqual([])
    expect(wiped.queue).toEqual([])
  })

  it('answers the same to the keyboard shortcut as to the command', () => {
    const wiped = reduce(booted, cleared())
    expect(wiped.lines).toEqual([])
    expect(wiped.queue).toEqual([])
  })

  it('has nothing to print once the screen is empty', () => {
    const wiped = reduce(booted, cleared())
    expect(reduce(wiped, lineDrained())).toEqual(wiped)
  })
})

describe('moving between directories', () => {
  it('follows the visitor into the work directory and back out again', () => {
    const inWork = run(booted, 'cd work')
    expect(inWork.cwd).toBe('~/work')
    expect(run(inWork, 'cd ..').cwd).toBe('~')
  })

  it('keeps what is already on the screen when it moves', () => {
    expect(run(booted, 'cd work').lines.length).toBeGreaterThan(booted.lines.length)
  })
})

describe('rebooting', () => {
  it('prints the shutdown notice and asks the host to replay the splash later', () => {
    const shutdown = run(booted, 'reboot')
    expect(printedBy(booted, shutdown)).toContain(
      'broadcast message: the system is going down for reboot now',
    )
    expect(shutdown.scheduled).toEqual([{ kind: 'reboot', delayMs: 1400 }])
  })

  it('drops the splash it was still printing, leaving only the shutdown notice', () => {
    const interrupted = dispatched(createSession(volume), typed('reboot', 6), submitted())
    expect(screenText(drained(interrupted).lines)).toEqual([
      'payam@yasaie ~ $ reboot',
      'broadcast message: the system is going down for reboot now',
      '',
      '[  ok  ] stopped nothing in particular',
      '[  ok  ] unmounted sixteen years',
      '[  ok  ] reached target power-off',
      '',
    ])
  })

  it('prints the shutdown notice slowly, the way a machine going down does', () => {
    const interrupted = dispatched(createSession(volume), typed('reboot', 6), submitted())
    expect(interrupted.queue.map((queued) => queued.speedMs)).toEqual(
      interrupted.queue.map(() => 120),
    )
  })

  it('leaves a pending reboot alone when some other timer reports back', () => {
    const shutdown = run(booted, 'reboot')

    const unrelated = dispatched(shutdown, scheduleConsumed({ kind: 'reward', delayMs: 600 }))

    expect(unrelated.scheduled).toEqual(shutdown.scheduled)
    expect(unrelated.lines).toEqual(shutdown.lines)
  })

  it('wipes the screen, returns home and starts the splash again when the moment comes', () => {
    const shutdown = run(run(booted, 'cd work'), 'reboot')
    const replayed = dispatched(shutdown, scheduleConsumed({ kind: 'reboot', delayMs: 1400 }))
    expect(replayed.lines).toEqual([])
    expect(replayed.cwd).toBe('~')
    expect(replayed.scheduled).toEqual([])
    expect(screenText(drained(replayed).lines)).toEqual(screenText(booted.lines))
  })
})

describe('the scrollback', () => {
  it('keeps the last four hundred lines and forgets what scrolled off the top', () => {
    const many = Array.from({ length: 500 }, (_, position) => text(String(position), 'body'))
    const filled = drained({ ...booted, lines: [], queue: queuedLines(many, 0) })
    expect(filled.lines).toHaveLength(400)
    expect(screenText(filled.lines).at(0)).toBe('100')
    expect(screenText(filled.lines).at(-1)).toBe('499')
  })
})

describe('the command history', () => {
  it('remembers what was run, newest first', () => {
    expect(run(run(booted, 'whoami'), 'stack').history).toEqual(['stack', 'whoami'])
  })

  it('recalls the last command with the caret at its end when the visitor presses up', () => {
    const recalled = dispatched(run(booted, 'work 2'), historyBack())
    expect(recalled.typed).toBe('work 2')
    expect(recalled.caret).toBe(6)
  })

  it('empties the prompt again on the way back down past the newest command', () => {
    const returned = dispatched(run(booted, 'work 2'), historyBack(), historyForward())
    expect(returned.typed).toBe('')
    expect(returned.caret).toBe(0)
  })

  it('leaves the prompt alone when there is no history to walk', () => {
    const typing = dispatched(booted, typed('who', 3), historyBack())
    expect(typing.typed).toBe('who')
  })
})

describe('accepting the suggestion', () => {
  it('completes the line and puts the caret at its end', () => {
    const accepted = dispatched(booted, typed('sta', 3), suggestionAccepted())
    expect(accepted.typed).toBe('stack')
    expect(accepted.caret).toBe(5)
  })

  it('leaves the line alone when there is nothing to accept', () => {
    const untouched = dispatched(booted, typed('zzz', 3), suggestionAccepted())
    expect(untouched.typed).toBe('zzz')
    expect(untouched.caret).toBe(3)
  })
})

describe('the prompt itself', () => {
  it('holds what has been typed and where the caret sits', () => {
    const typing = dispatched(booted, typed('work 2', 6), caretMoved(4))
    expect(typing.typed).toBe('work 2')
    expect(typing.caret).toBe(4)
  })

  it('knows whether the prompt has focus, so the block cursor can dim', () => {
    expect(dispatched(booted, focusChanged(true)).focused).toBe(true)
    expect(dispatched(booted, focusChanged(true), focusChanged(false)).focused).toBe(false)
  })
})

describe('the game', () => {
  it('credits a command once, whichever of its names was typed', () => {
    expect(run(run(run(booted, 'whoami'), 'whoami'), 'cv').discovered).toEqual(['whoami', 'work'])
  })

  it('credits the command behind a document the visitor read with cat', () => {
    expect(run(booted, 'cat whoami.txt').discovered).toEqual(['whoami'])
  })

  it('asks for the reward only once every one of the nine has been found', () => {
    const eight = ['whoami', 'work', 'stack', 'contact', 'help', 'sudo', 'impossible', 'tabriz']
    const nearly = eight.reduce(run, booted)
    expect(nearly.discovered).toHaveLength(8)
    expect(nearly.scheduled).toEqual([])

    const complete = run(nearly, 'coffee')
    expect(complete.scheduled).toEqual([{ kind: 'reward', delayMs: 600 }])
  })

  it('prints the reward when the moment comes, and stops waiting for it', () => {
    const complete = [
      'whoami',
      'work',
      'stack',
      'contact',
      'help',
      'sudo',
      'impossible',
      'tabriz',
      'coffee',
    ].reduce(run, booted)
    const rewarded = drained(
      dispatched(complete, scheduleConsumed({ kind: 'reward', delayMs: 600 })),
    )
    expect(printedBy(complete, rewarded)).toEqual([
      'all nine. you read the whole thing. that deserves a reply: payam@yasaie.com',
      '',
    ])
    expect(rewarded.scheduled).toEqual([])
  })
})

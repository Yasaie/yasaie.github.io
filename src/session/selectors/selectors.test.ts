import { describe, expect, it } from 'vitest'
import { mountRealDisk } from '@/testing/disk/disk'
import { blank, text } from '@/tty/line/line'
import { createSession, queuedLines, type TerminalState } from '../state/state'
import { ghostText, nextDelayMs, progressLabel, prompt, statusLine, suggestion } from './selectors'

const volume = await mountRealDisk()

const session = (over: Partial<TerminalState> = {}): TerminalState => ({
  ...createSession(volume),
  queue: [],
  ...over,
})

describe('the prompt a visitor types at', () => {
  it('names the machine and the directory they are standing in', () => {
    expect(prompt(session())).toBe('payam@yasaie ~ $')
    expect(prompt(session({ cwd: '~/work' }))).toBe('payam@yasaie ~/work $')
  })
})

describe('the status beside the prompt', () => {
  it('counts the commands found out of the nine there are', () => {
    expect(progressLabel(session())).toBe('0/9')
    expect(progressLabel(session({ discovered: ['whoami', 'work', 'stack'] }))).toBe('3/9')
  })

  it('mentions the tab key on a wide screen while there is something to accept', () => {
    expect(statusLine(session({ typed: 'sta' }), true)).toBe('tab ↹ · 0/9')
  })

  it('drops the tab hint when there is nothing left to suggest', () => {
    expect(statusLine(session({ typed: 'zzz' }), true)).toBe('0/9')
  })

  it('shows the count alone on a narrow screen, where the hint would not fit', () => {
    expect(statusLine(session({ typed: 'sta' }), false)).toBe('0/9')
  })
})

describe('what the prompt offers to complete', () => {
  it('names the command it would accept and shows only the letters still missing', () => {
    const typing = session({ typed: 'sta', caret: 3 })
    expect(suggestion(typing)).toBe('stack')
    expect(ghostText(typing)).toBe('ck')
  })
})

describe('the pause before the next line is printed', () => {
  it('waits the speed the line was queued at', () => {
    expect(nextDelayMs(session({ queue: queuedLines([text('whoami', 'text')], 28) }))).toBe(28)
  })

  it('prints a blank line at once, so a gap never stutters', () => {
    expect(nextDelayMs(session({ queue: queuedLines([blank], 28) }))).toBe(0)
  })

  it('waits for nothing when there is nothing left to print', () => {
    expect(nextDelayMs(session())).toBe(0)
  })
})

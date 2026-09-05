import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Action } from '@/session/actions/actions'
import { lineDrained } from '@/session/actions/actions'
import { createSession, queuedLines, type TerminalState } from '@/session/state/state'
import { mountRealDisk } from '@/testing/disk/disk'
import { thisYear } from '@/testing/year/year'
import { blank, text } from '@/tty/line/line'
import { useTypewriter } from './use-typewriter'

const volume = await mountRealDisk()

const session = (over: Partial<TerminalState> = {}): TerminalState => ({
  ...createSession(volume, thisYear),
  queue: [],
  ...over,
})

const printing = (state: TerminalState) => {
  const printed: Action[] = []
  const view = renderHook(({ typing }) => useTypewriter(typing, (action) => printed.push(action)), {
    initialProps: { typing: state },
  })
  return { printed, view }
}

beforeEach(() => vi.useFakeTimers())

afterEach(() => vi.useRealTimers())

describe('typing the queued lines out one at a time', () => {
  it('waits the pause the line was queued with before printing it', () => {
    const { printed } = printing(session({ queue: queuedLines([text('whoami', 'text')], 28) }))

    vi.advanceTimersByTime(27)
    expect(printed).toEqual([])

    vi.advanceTimersByTime(1)
    expect(printed).toEqual([lineDrained()])
  })

  it('prints a blank line straight away, so a gap in the output never stutters', () => {
    const { printed } = printing(session({ queue: queuedLines([blank], 28) }))

    vi.advanceTimersByTime(0)

    expect(printed).toEqual([lineDrained()])
  })

  it('asks for one line at a time and waits to be told it was printed', () => {
    const { printed } = printing(
      session({ queue: queuedLines([text('one', 'text'), text('two', 'text')], 28) }),
    )

    vi.advanceTimersByTime(1000)

    expect(printed).toEqual([lineDrained()])
  })

  it('falls silent once there is nothing left to print', () => {
    const { printed } = printing(session())

    vi.advanceTimersByTime(1000)

    expect(printed).toEqual([])
  })

  it('drops the line it was waiting on when the queue is flushed', () => {
    const { printed, view } = printing(
      session({ queue: queuedLines([text('whoami', 'text')], 28) }),
    )

    view.rerender({ typing: session() })
    vi.advanceTimersByTime(1000)

    expect(printed).toEqual([])
  })
})

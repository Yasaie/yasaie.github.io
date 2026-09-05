import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mountRealDisk } from '#tests/helpers/disk'
import { textOf } from '#tests/helpers/rows'
import { settle } from '#tests/helpers/settle'
import { setViewportWidth } from '#tests/helpers/viewport'
import { submitted, typed } from '@/session/actions/actions'
import { useTerminal } from './use-terminal'

const volume = await mountRealDisk()

const terminal = () => renderHook(() => useTerminal(volume)).result

beforeEach(() => vi.useFakeTimers())

afterEach(() => vi.useRealTimers())

describe('the running terminal', () => {
  it('prints nothing until the machine has had a moment to boot', () => {
    expect(terminal().current.state.lines).toEqual([])
  })

  it('types the boot splash onto the screen by itself', async () => {
    const machine = terminal()

    await settle()

    expect(textOf(machine.current.state.lines)).toContain('name    Payam Yasaie')
  })

  it('runs what the visitor typed and prints the answer under the echo', async () => {
    const machine = terminal()
    await settle()

    act(() => machine.current.dispatch(typed('whoami', 6)))
    act(() => machine.current.dispatch(submitted()))
    await settle()

    const printed = textOf(machine.current.state.lines)
    expect(printed).toContain('payam@yasaie ~ $ whoami')
    expect(printed).toContain('full stack since 2010. Tabriz, then Eindhoven.')
  })

  it('offers the rest of the command as the visitor types', async () => {
    const machine = terminal()
    await settle()

    act(() => machine.current.dispatch(typed('sta', 3)))

    expect(machine.current.suggestion).toBe('stack')
    expect(machine.current.ghost).toBe('ck')
  })

  it('counts the commands found, mentioning tab only where the hint fits', async () => {
    const machine = terminal()
    await settle()
    expect(machine.current.statusLine).toBe('tab ↹ · 0/9')

    act(() => machine.current.dispatch(typed('whoami', 6)))
    act(() => machine.current.dispatch(submitted()))
    await settle()
    expect(machine.current.statusLine).toBe('tab ↹ · 1/9')

    act(() => setViewportWidth(400))
    expect(machine.current.isNarrow).toBe(true)
    expect(machine.current.statusLine).toBe('1/9')
  })

  it('brings the machine back up by itself a moment after a reboot', async () => {
    const machine = terminal()
    await settle()
    const bootedOnce = textOf(machine.current.state.lines)

    act(() => machine.current.dispatch(typed('reboot', 6)))
    act(() => machine.current.dispatch(submitted()))
    await settle()

    expect(textOf(machine.current.state.lines)).toEqual(bootedOnce)
  })
})

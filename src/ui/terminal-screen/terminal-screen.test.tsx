import { configure, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { withoutACanvasEngine } from '#tests/helpers/canvas'
import { mountRealDisk } from '#tests/helpers/disk'
import { settle, settleUntil } from '#tests/helpers/settle'
import { TerminalScreen } from './terminal-screen'

const withoutWaitingOnRealTime = <Result,>(work: () => Promise<Result>): Promise<Result> => work()

configure({ asyncWrapper: withoutWaitingOnRealTime })

const volume = await mountRealDisk()

const lineHeight = 20

const rowsOnScreen = (): readonly Element[] => [...document.querySelectorAll('[data-row]')]

const printed = (): readonly string[] => rowsOnScreen().map((row) => row.textContent ?? '')

const hasPrinted = (line: string) => (): boolean => printed().includes(line)

const arrives = () => {
  render(<TerminalScreen volume={volume} />)
  const visitor = userEvent.setup({ delay: null })
  return {
    types: (keys: string) => visitor.keyboard(keys),
    runs: (command: string) => visitor.type(screen.getByLabelText('command'), `${command}{Enter}`),
    clicks: (line: string) =>
      visitor.click(rowsOnScreen().find((row) => row.textContent === line) as Element),
    presses: (label: string) =>
      visitor.click(
        screen
          .getAllByRole('button')
          .filter((row) => row.textContent?.includes(label))[0] as Element,
      ),
  }
}

beforeEach(() => vi.useFakeTimers())

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('a visitor arriving at the terminal', () => {
  it('watches the machine boot and introduce the person it belongs to', async () => {
    arrives()

    await settleUntil(hasPrinted('type  help  or press tab'))

    expect(printed().at(0)).toContain('██╗')
    expect(printed()).toContain('name    Payam Yasaie')
    expect(printed()).toContain('role    senior software engineer')
    expect(printed()).toContain('where   Eindhoven, NL')
  })

  it('starts typing anywhere on the page and lands in the prompt', async () => {
    const visitor = arrives()
    await settle(20)

    await visitor.types('w')

    expect(screen.getByLabelText('command')).toHaveFocus()
  })

  it('asks for help and is told what there is to read', async () => {
    const visitor = arrives()
    await settle(20)

    await visitor.runs('help')
    await settleUntil(hasPrinted('there are a few more. guess.'))

    expect(printed()).toContain('payam@yasaie ~ $ help')
    expect(printed()).toContain('whoami   the short version')
    expect(printed()).toContain('work     six chapters, 2010 to now · work <n> for one')
  })

  it('reads the work history, then the one chapter it wants', async () => {
    const visitor = arrives()
    await settle(20)

    await visitor.runs('work')
    await settleUntil(
      hasPrinted('[2]  2021 – 2025  OWOW Agency          senior frontend developer'),
    )

    await visitor.runs('work 2')
    await settleUntil(
      hasPrinted('- a housing platform MVP that sold 45 homes in ten weeks.'),
    )

    expect(printed()).toContain('2021 – 2025  OWOW Agency')
    expect(printed()).toContain('senior frontend developer · Eindhoven')
  })

  it('opens a chapter when the visitor presses the line naming it, without typing', async () => {
    const visitor = arrives()
    await settle(20)

    await visitor.runs('work')
    await settleUntil(
      hasPrinted(
        'work <n> for one, or click a line. all of it shipped behind logins, nothing to visit.',
      ),
    )
    await visitor.presses('[2]')
    await settleUntil(hasPrinted('senior frontend developer · Eindhoven'))

    expect(printed()).toContain('payam@yasaie ~ $ work 2')
    expect(printed()).toContain('2021 – 2025  OWOW Agency')
  })

  it('is thanked with an address to reply to once all nine commands are found', async () => {
    const visitor = arrives()
    await settle(20)

    await visitor.runs('whoami')
    await visitor.runs('work')
    await visitor.runs('stack')
    await visitor.runs('contact')
    await visitor.runs('sudo')
    await visitor.runs('tabriz')
    await visitor.runs('coffee')
    await visitor.runs('hire')
    await visitor.runs('vim')

    await settleUntil(
      hasPrinted('all nine. anything the machine left out, ask me: payam@yasaie.com'),
      400,
    )

    expect(screen.getByText('9/9')).toBeInTheDocument()
  })
})

describe('the terminal a visitor is looking at', () => {
  it('takes a click anywhere on its output as a click into the prompt', async () => {
    const visitor = arrives()
    await settleUntil(hasPrinted('name    Payam Yasaie'))

    await visitor.clicks('name    Payam Yasaie')

    expect(screen.getByLabelText('command')).toHaveFocus()
  })

  it('stirs the field of dots behind it as the pointer crosses the page', async () => {
    const field = withoutACanvasEngine()
    arrives()
    await settle(2)

    fireEvent.pointerMove(window, { clientX: 300, clientY: 200 })
    field.drawOneFrame()

    expect(field.painted.length).toBeGreaterThan(0)
  })

  it('answers a turn of the wheel by whole lines, never by pixels', async () => {
    arrives()
    await settle(20)
    const scrollback = screen.getByRole('log')
    scrollback.style.lineHeight = `${lineHeight}px`

    fireEvent.wheel(scrollback, { deltaY: lineHeight * 2 + 5 })

    expect(scrollback.scrollTop).toBe(lineHeight * 2)
  })
})

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'
import { browserSource } from '@/fs/browser-source/browser-source'
import { mount } from '@/fs/volume/volume'
import { TerminalScreen } from './terminal-screen'

const servedDisk = await mount(browserSource())

const printing = { timeout: 5_000 }

const shortScreen = { width: 1280, height: 300 }

const phone = { width: 390, height: 844 }

const safariZoomsBelow = 16

const onScreen = (text: string): Promise<HTMLElement> =>
  waitFor(() => {
    const readable = screen.getAllByText(text).filter((drawn) => drawn.checkVisibility())
    expect(readable).toHaveLength(1)
    return readable[0] as HTMLElement
  }, printing)

const scrollback = (): HTMLElement => screen.getByRole('log')

describe('the terminal a visitor lands on', () => {
  it('prints the person it belongs to, read from the disk the site serves', async () => {
    render(<TerminalScreen volume={servedDisk} />)

    expect(await onScreen('Payam Yasaie')).toBeVisible()
    expect(await onScreen('senior software engineer')).toBeVisible()
  })

  it('scrolls back by whole printed lines, measured against the type it prints in', async () => {
    await page.viewport(shortScreen.width, shortScreen.height)
    render(<TerminalScreen volume={servedDisk} />)
    await onScreen('Payam Yasaie')
    const region = scrollback()
    await waitFor(() => expect(region.scrollHeight).toBeGreaterThan(region.clientHeight))
    const lineHeight = Number.parseFloat(getComputedStyle(region).lineHeight)
    const bottom = region.scrollTop

    fireEvent.wheel(region, { deltaY: -(lineHeight * 2 + 5) })

    expect(lineHeight).toBeGreaterThan(0)
    expect((bottom - region.scrollTop) / lineHeight).toBeCloseTo(2, 1)
  })

  it('sets type no smaller than safari will read without zooming the prompt', async () => {
    await page.viewport(phone.width, phone.height)
    render(<TerminalScreen volume={servedDisk} />)
    await onScreen('Payam Yasaie')

    const typed = Number.parseFloat(getComputedStyle(screen.getByLabelText('command')).fontSize)

    expect(typed).toBeGreaterThanOrEqual(safariZoomsBelow)
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { link } from '@/tty/line/line'
import { LineSegment } from './line-segment'

const addresses = [
  link('payam@yasaie.com', 'text', 'mailto:payam@yasaie.com'),
  link('linkedin.com/in/yasaie', 'body', 'https://linkedin.com/in/yasaie'),
  link('github.com/yasaie', 'body', 'https://github.com/yasaie'),
]

const printed = (): void => {
  render(addresses.map((address) => <LineSegment key={address.text} segment={address} />))
}

const holdTheFollowKey = (): void => {
  fireEvent.keyDown(window, { key: 'Meta', metaKey: true })
}

const underlined = (): readonly string[] =>
  addresses
    .map((address) => screen.getByText(address.text))
    .filter((drawn) => getComputedStyle(drawn).textDecorationLine === 'underline')
    .map((drawn) => drawn.textContent ?? '')

describe('an address printed in the terminal', () => {
  it('reads as plain text under the pointer, so the screen is not a web page', async () => {
    printed()

    await userEvent.hover(screen.getByText('github.com/yasaie'))

    expect(underlined()).toEqual([])
  })

  it('underlines only the address the pointer is on while the follow key is held', async () => {
    printed()

    holdTheFollowKey()
    await userEvent.hover(screen.getByText('linkedin.com/in/yasaie'))

    expect(underlined()).toEqual(['linkedin.com/in/yasaie'])
  })

  it('offers the hand cursor once it can be followed, and the text cursor before', async () => {
    printed()
    const address = screen.getByText('github.com/yasaie')
    const reading = getComputedStyle(address).cursor

    holdTheFollowKey()

    expect(reading).toBe('text')
    expect(getComputedStyle(address).cursor).toBe('pointer')
  })
})

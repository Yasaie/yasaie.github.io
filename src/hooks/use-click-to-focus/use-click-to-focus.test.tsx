import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useClickToFocus } from './use-click-to-focus'

const Screen = (): ReactElement => {
  const field = useClickToFocus<HTMLInputElement>()
  return (
    <div>
      <input aria-label="command" ref={field} />
      <a href="#contact">linkedin.com/in/yasaie</a>
      <p>some output</p>
    </div>
  )
}

const selecting = (selected: string): void => {
  vi.spyOn(window, 'getSelection').mockReturnValue({
    toString: () => selected,
  } as unknown as Selection)
}

afterEach(() => vi.restoreAllMocks())

describe('clicking the terminal', () => {
  it('puts the caret back in the prompt, wherever on the screen the click landed', () => {
    render(<Screen />)

    fireEvent.click(screen.getByText('some output'))

    expect(screen.getByLabelText('command')).toHaveFocus()
  })

  it('leaves a link alone so it can still be followed', () => {
    render(<Screen />)

    fireEvent.click(screen.getByText('linkedin.com/in/yasaie'))

    expect(screen.getByLabelText('command')).not.toHaveFocus()
  })

  it('does not steal the caret from text the visitor is selecting to copy', () => {
    render(<Screen />)
    selecting('Payam Yasaie')

    fireEvent.click(screen.getByText('some output'))

    expect(screen.getByLabelText('command')).not.toHaveFocus()
  })

  it('still focuses the prompt in a browser that reports no selection at all', () => {
    render(<Screen />)
    vi.spyOn(window, 'getSelection').mockReturnValue(null)

    fireEvent.click(screen.getByText('some output'))

    expect(screen.getByLabelText('command')).toHaveFocus()
  })

  it('does nothing at all once the terminal has left the page', () => {
    render(<Screen />).unmount()

    expect(() => fireEvent.click(document.body)).not.toThrow()
  })
})

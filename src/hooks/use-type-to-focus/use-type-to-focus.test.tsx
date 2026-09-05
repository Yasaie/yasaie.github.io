import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { useTypeToFocus } from './use-type-to-focus'

const Prompt = (): ReactElement => {
  const field = useTypeToFocus<HTMLInputElement>()
  return <input aria-label="command" ref={field} />
}

describe('a visitor who starts typing without clicking first', () => {
  it('lands in the prompt, so nothing they type is lost', () => {
    render(<Prompt />)

    fireEvent.keyDown(document.body, { key: 'w' })

    expect(screen.getByLabelText('command')).toHaveFocus()
  })

  it('is left alone when the key is a browser shortcut rather than a letter', () => {
    render(<Prompt />)

    fireEvent.keyDown(document.body, { key: 'r', metaKey: true })
    fireEvent.keyDown(document.body, { key: 'l', ctrlKey: true })
    fireEvent.keyDown(document.body, { key: 'Tab' })

    expect(screen.getByLabelText('command')).not.toHaveFocus()
  })

  it('is left alone when there is no prompt on the page to type into', () => {
    render(<Prompt />).unmount()

    expect(() => fireEvent.keyDown(document.body, { key: 'w' })).not.toThrow()
  })
})

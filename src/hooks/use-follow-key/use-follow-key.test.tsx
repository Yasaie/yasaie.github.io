import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { useFollowKey } from './use-follow-key'

const Screen = (): ReactElement => <p>{useFollowKey() ? 'following' : 'reading'}</p>

describe('the key a visitor holds to follow a link', () => {
  it('is the command key, the way a terminal on a mac behaves', () => {
    render(<Screen />)

    fireEvent.keyDown(window, { key: 'Meta', metaKey: true })

    expect(screen.getByText('following')).toBeInTheDocument()
  })

  it('is control everywhere else, so the same trick works off a mac', () => {
    render(<Screen />)

    fireEvent.keyDown(window, { key: 'Control', ctrlKey: true })

    expect(screen.getByText('following')).toBeInTheDocument()
  })

  it('does nothing on its own, so ordinary typing never turns the screen into links', () => {
    render(<Screen />)

    fireEvent.keyDown(window, { key: 'c' })

    expect(screen.getByText('reading')).toBeInTheDocument()
  })

  it('stops following the moment the key comes back up', () => {
    render(<Screen />)

    fireEvent.keyDown(window, { key: 'Meta', metaKey: true })
    fireEvent.keyUp(window, { key: 'Meta' })

    expect(screen.getByText('reading')).toBeInTheDocument()
  })

  it('lets go when the visitor switches away still holding it, so it cannot stick', () => {
    render(<Screen />)

    fireEvent.keyDown(window, { key: 'Meta', metaKey: true })
    fireEvent.blur(window)

    expect(screen.getByText('reading')).toBeInTheDocument()
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import type { ReactElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { serveRealDisk } from '#tests/helpers/disk-server'

const freshApp = async (): Promise<() => ReactElement | null> => {
  vi.resetModules()
  return (await import('@/ui/app/app')).App
}

const servingTheRealDisk = async (): Promise<void> => {
  const serve = await serveRealDisk()
  vi.stubGlobal('fetch', (url: string) => serve(String(url)))
}

const servingNothing = (): void => {
  vi.stubGlobal(
    'fetch',
    async () => new Response('not found', { status: 404, statusText: 'File not found' }),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('the site a visitor loads', () => {
  it('shows nothing while the machine is still mounting its disk', async () => {
    await servingTheRealDisk()
    const App = await freshApp()

    const { container } = render(<App />)

    expect(container).toBeEmptyDOMElement()
  })

  it('hands the visitor a terminal to type into once the disk is mounted', async () => {
    await servingTheRealDisk()
    const App = await freshApp()

    render(<App />)

    await waitFor(() => expect(screen.getByLabelText('command')).toBeInTheDocument())
  })

  it('says what it could not read rather than leaving the visitor an empty page', async () => {
    servingNothing()
    const App = await freshApp()

    render(<App />)

    await waitFor(() =>
      expect(
        screen.getByText('mount: /: cannot read /superblock.json: 404 File not found'),
      ).toBeInTheDocument(),
    )
  })
})

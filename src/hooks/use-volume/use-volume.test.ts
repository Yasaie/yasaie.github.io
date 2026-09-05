import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { realText, serveRealDisk } from '@/test/disk/disk'
import type { VolumeMount } from './use-volume'

const whoamiPath = '/home/payam/eindhoven/whoami.txt'

const freshHook = async (): Promise<() => VolumeMount> => {
  vi.resetModules()
  return (await import('./use-volume')).useVolume
}

const servingTheRealDisk = async (): Promise<readonly string[]> => {
  const serve = await serveRealDisk()
  const requested: string[] = []
  vi.stubGlobal('fetch', (url: string) => {
    requested.push(String(url))
    return serve(String(url))
  })
  return requested
}

const servingNothing = (): void => {
  vi.stubGlobal(
    'fetch',
    async () => new Response('not found', { status: 404, statusText: 'File not found' }),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('mounting the disk the site was deployed with', () => {
  it('hands the machine a volume it can read its own documents out of', async () => {
    await servingTheRealDisk()
    const useVolume = await freshHook()

    const { result } = renderHook(() => useVolume())

    await waitFor(() => expect(result.current.status).toBe('ready'))
    expect(result.current.volume?.read(whoamiPath)).toBe(realText(whoamiPath))
  })

  it('mounts the volume once, however many parts of the page ask for it', async () => {
    const requested = await servingTheRealDisk()
    const useVolume = await freshHook()

    const first = renderHook(() => useVolume())
    const second = renderHook(() => useVolume())

    await waitFor(() => expect(first.result.current.status).toBe('ready'))
    await waitFor(() => expect(second.result.current.status).toBe('ready'))
    expect(requested.filter((url) => url === '/.superblock.json')).toHaveLength(1)
  })

  it('waits without an answer while the disk is still being read', async () => {
    await servingTheRealDisk()
    const useVolume = await freshHook()

    const { result } = renderHook(() => useVolume())

    expect(result.current).toEqual({ status: 'mounting', volume: undefined, failure: undefined })
  })
})

describe('a disk the machine cannot read', () => {
  it('reports the reason it was given even when that reason is not an error', async () => {
    vi.stubGlobal('fetch', () => Promise.reject('the network is down'))
    const useVolume = await freshHook()

    const { result } = renderHook(() => useVolume())

    await waitFor(() => expect(result.current.status).toBe('failed'))
    expect(result.current.failure).toBe('the network is down')
  })

  it('says what it could not read instead of leaving the visitor an empty page', async () => {
    servingNothing()
    const useVolume = await freshHook()

    const { result } = renderHook(() => useVolume())

    await waitFor(() => expect(result.current.status).toBe('failed'))
    expect(result.current.failure).toBe('cannot read /.superblock.json: 404 File not found')
  })
})

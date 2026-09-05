import { useEffect, useState } from 'react'
import { browserSource } from '@/fs/browser-source/browser-source'
import { mount, type Volume } from '@/fs/volume/volume'

export type VolumeMount =
  | { readonly status: 'mounting'; readonly volume: undefined; readonly failure: undefined }
  | { readonly status: 'ready'; readonly volume: Volume; readonly failure: undefined }
  | { readonly status: 'failed'; readonly volume: undefined; readonly failure: string }

const mounting: VolumeMount = Object.freeze({
  status: 'mounting',
  volume: undefined,
  failure: undefined,
})

const mounted = (volume: Volume): VolumeMount => ({ status: 'ready', volume, failure: undefined })

const failed = (reason: unknown): VolumeMount => ({
  status: 'failed',
  volume: undefined,
  failure: reason instanceof Error ? reason.message : String(reason),
})

let pending: Promise<Volume> | undefined

const mountOnce = (): Promise<Volume> => {
  pending ??= mount(browserSource())
  return pending
}

export const useVolume = (): VolumeMount => {
  const [state, setState] = useState<VolumeMount>(mounting)

  useEffect(() => {
    mountOnce().then(
      (volume) => setState(mounted(volume)),
      (reason: unknown) => setState(failed(reason)),
    )
  }, [])

  return state
}

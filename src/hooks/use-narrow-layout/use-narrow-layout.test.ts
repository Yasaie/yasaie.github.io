import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { setViewportWidth } from '@/testing/viewport/viewport'
import { useNarrowLayout } from './use-narrow-layout'

describe('the narrow layout', () => {
  it('is on below six hundred pixels, where a padded row would not fit', () => {
    setViewportWidth(599)
    expect(renderHook(() => useNarrowLayout()).result.current).toBe(true)
  })

  it('is off from six hundred pixels upward', () => {
    setViewportWidth(600)
    expect(renderHook(() => useNarrowLayout()).result.current).toBe(false)
  })

  it('follows the window as the visitor resizes it', () => {
    const { result } = renderHook(() => useNarrowLayout())
    expect(result.current).toBe(false)
    act(() => setViewportWidth(400))
    expect(result.current).toBe(true)
  })
})

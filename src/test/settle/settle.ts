import { act } from '@testing-library/react'
import { vi } from 'vitest'

const stepMs = 1500

const defaultSteps = 80

export const settle = async (steps: number = defaultSteps): Promise<void> => {
  for (let step = 0; step < steps; step += 1) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(stepMs)
    })
  }
}

export const settleUntil = async (
  printed: () => boolean,
  steps: number = defaultSteps,
): Promise<void> => {
  for (let step = 0; step < steps; step += 1) {
    if (printed()) return
    await act(async () => {
      await vi.advanceTimersByTimeAsync(stepMs)
    })
  }
}

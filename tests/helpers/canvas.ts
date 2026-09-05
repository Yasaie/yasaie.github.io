import { vi } from 'vitest'

export type Dot = { readonly x: number; readonly y: number; readonly ink: string }

export type PaintedCanvas = {
  readonly painted: Dot[]
  readonly drawOneFrame: () => void
  readonly isIdle: () => boolean
}

export const withoutACanvasEngine = (): PaintedCanvas => {
  const painted: Dot[] = []
  let nextFrame: FrameRequestCallback | undefined

  const brush = {
    clearRect: () => undefined,
    fillRect: (x: number, y: number, width: number, height: number) =>
      painted.push({ x: x + width / 2, y: y + height / 2, ink: brush.fillStyle }),
    fillStyle: '',
  }

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    brush as unknown as CanvasRenderingContext2D,
  )

  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    nextFrame = callback
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => undefined)

  return {
    painted,
    drawOneFrame: () => {
      const frame = nextFrame
      nextFrame = undefined
      frame?.(performance.now())
    },
    isIdle: () => nextFrame === undefined,
  }
}

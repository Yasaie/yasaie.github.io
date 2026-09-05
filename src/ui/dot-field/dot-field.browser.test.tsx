import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { traceReachPx } from '@/lib/trail/trail'
import { DotField } from './dot-field'

const pointerAt = { x: 320, y: 240 }

const target = {
  position: 'fixed' as const,
  left: `${pointerAt.x}px`,
  top: `${pointerAt.y}px`,
  width: '2px',
  height: '2px',
}

const painted = (): HTMLCanvasElement => {
  const canvas = document.querySelector('canvas')
  if (canvas === null) throw new Error('the terminal drew no field')
  return canvas
}

const litAround = (x: number, y: number, reach: number): number => {
  const brush = painted().getContext('2d')
  if (brush === null) throw new Error('the browser gave no canvas to paint on')
  const box = brush.getImageData(x - reach, y - reach, reach * 2, reach * 2)
  return box.data.filter((_, channel) => channel % 4 === 3).filter((alpha) => alpha > 0).length
}

const aFrameLater = (): Promise<void> =>
  new Promise((settled) => requestAnimationFrame(() => requestAnimationFrame(() => settled())))

const pointerCrossesTheField = async (): Promise<void> => {
  render(
    <>
      <div data-testid="somewhere" style={target} />
      <DotField />
    </>,
  )
  await userEvent.hover(screen.getByTestId('somewhere'))
  await aFrameLater()
}

describe('the field of dots behind the terminal', () => {
  it('lights the dots the pointer passes over', async () => {
    await pointerCrossesTheField()

    expect(litAround(pointerAt.x, pointerAt.y, traceReachPx)).toBeGreaterThan(0)
  })

  it('leaves the rest of the screen dark, so it reads as a trail and not a wash', async () => {
    await pointerCrossesTheField()

    expect(litAround(pointerAt.x + traceReachPx * 4, pointerAt.y, traceReachPx)).toBe(0)
  })
})

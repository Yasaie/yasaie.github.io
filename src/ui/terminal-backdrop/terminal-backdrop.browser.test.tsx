import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'
import { TerminalBackdrop } from './terminal-backdrop'

const gridPx = 28

const dotPx = 2

const pointerAt = { x: 420, y: 320 }

const target = {
  position: 'fixed' as const,
  left: `${pointerAt.x}px`,
  top: `${pointerAt.y}px`,
  width: '2px',
  height: '2px',
}

const aFrameLater = (): Promise<void> =>
  new Promise((settled) => requestAnimationFrame(() => requestAnimationFrame(() => settled())))

const litOffsetsFromTheGrid = async (): Promise<readonly number[]> => {
  render(
    <>
      <div data-testid="somewhere" style={target} />
      <TerminalBackdrop />
    </>,
  )
  await userEvent.hover(screen.getByTestId('somewhere'))
  await aFrameLater()

  const printed = document.querySelector('[data-dots]')
  const canvas = document.querySelector('canvas')
  if (printed === null || canvas === null) throw new Error('the backdrop drew no field')
  const box = printed.getBoundingClientRect()
  const brush = canvas.getContext('2d')
  if (brush === null) throw new Error('the browser gave no canvas to paint on')

  const reach = 60
  const patch = brush.getImageData(pointerAt.x - reach, pointerAt.y - reach, reach * 2, reach * 2)
  const offsets: number[] = []
  for (let at = 3; at < patch.data.length; at += 4) {
    if ((patch.data[at] ?? 0) === 0) continue
    const pixel = (at - 3) / 4
    const x = pointerAt.x - reach + (pixel % patch.width)
    const y = pointerAt.y - reach + Math.floor(pixel / patch.width)
    const acrossTheGrid = (x - (box.left + gridPx / 2)) % gridPx
    const downTheGrid = (y - (box.top + gridPx / 2)) % gridPx
    offsets.push(Math.min(Math.abs(acrossTheGrid), gridPx - Math.abs(acrossTheGrid)))
    offsets.push(Math.min(Math.abs(downTheGrid), gridPx - Math.abs(downTheGrid)))
  }
  return offsets
}

const accent = 'rgb(255, 176, 32)'

const painted = (): readonly CSSStyleDeclaration[] => {
  const { container } = render(<TerminalBackdrop />)
  return [...container.querySelectorAll('*')].map((layer) => getComputedStyle(layer))
}

describe('the field of dots behind the terminal', () => {
  it('is painted in nothing the terminal prints in, so it can tint no part of the screen', () => {
    const tinted = painted().filter((style) =>
      [style.backgroundImage, style.backgroundColor, style.color].some((value) =>
        value.includes(accent),
      ),
    )

    expect(tinted).toEqual([])
  })

  it('lays no wash over the screen, since a gradient this dark renders as an edge', () => {
    const washed = painted().filter((style) => /gradient/.test(style.backgroundImage))

    expect(washed.every((style) => style.backgroundSize !== 'auto')).toBe(true)
  })

  it('is composited before the pointer has moved, so the first paint is dithered like the rest', () => {
    const { container } = render(<TerminalBackdrop />)
    const dotted = [...container.querySelectorAll<HTMLElement>('div')].filter(
      (layer) => getComputedStyle(layer).backgroundSize !== 'auto',
    )

    expect(dotted).toHaveLength(3)
    expect(dotted.filter((layer) => getComputedStyle(layer).transform === 'none')).toEqual([])
  })

  it('lights the dots that are already printed rather than drawing its own between them', async () => {
    const offsets = await litOffsetsFromTheGrid()

    expect(offsets.length).toBeGreaterThan(0)
    expect(Math.max(...offsets)).toBeLessThanOrEqual(dotPx)
  })
})

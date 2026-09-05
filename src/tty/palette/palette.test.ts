import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { type Colour, colourClass } from '@/tty/palette/palette'

const theme = readFileSync(join(process.cwd(), 'src/styles/index.css'), 'utf8')

const hexOf = (name: string): string | undefined =>
  new RegExp(`--color-terminal-${name}:\\s*(#[0-9a-f]{6});`).exec(theme)?.[1]

const channel = (value: number): number =>
  value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4

const luminance = (hex: string): number => {
  const [red, green, blue] = [1, 3, 5].map((at) =>
    channel(Number.parseInt(hex.slice(at, at + 2), 16) / 255),
  )
  return 0.2126 * (red ?? 0) + 0.7152 * (green ?? 0) + 0.0722 * (blue ?? 0)
}

const contrastWithBackground = (hex: string): number => {
  const [lighter, darker] = [luminance(hex), luminance(hexOf('bg') ?? '#000000')].toSorted(
    (a, b) => b - a,
  )
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05)
}

const inkColours = Object.keys(colourClass) as readonly Colour[]

describe('the palette', () => {
  it('names every colour the terminal is allowed to paint with', () => {
    expect(inkColours.toSorted()).toEqual(['accent', 'body', 'faint', 'muted', 'text'])
  })

  it('names only utilities the theme really defines, so nothing paints with a missing token', () => {
    expect(inkColours.filter((colour) => hexOf(colour) === undefined)).toEqual([])
  })

  it('gives each colour its own utility, so two roles never become indistinguishable', () => {
    expect(new Set(Object.values(colourClass)).size).toBe(inkColours.length)
  })

  it('stays legible on the terminal background, including the dimmest role', () => {
    const failing = inkColours.filter((colour) => contrastWithBackground(hexOf(colour) ?? '') < 4.5)
    expect(failing).toEqual([])
  })

  it('cannot be repainted at runtime, so one screen never disagrees with another', () => {
    expect(Object.isFrozen(colourClass)).toBe(true)
  })
})

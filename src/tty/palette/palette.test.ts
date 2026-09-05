import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { type Colour, colourClass } from '@/tty/palette/palette'

const theme = readFileSync(join(process.cwd(), 'src/styles/index.css'), 'utf8')

const tokenHex = (colour: Colour): string | undefined =>
  new RegExp(`--color-terminal-${colour}:\\s*(#[0-9a-fA-F]{6});`).exec(theme)?.[1]

describe('the palette', () => {
  it('names every colour the terminal is allowed to paint with', () => {
    expect(Object.keys(colourClass).toSorted()).toEqual([
      'accent',
      'body',
      'faint',
      'muted',
      'text',
    ])
  })

  it('paints each colour with the theme utility of the same name', () => {
    expect(colourClass).toEqual({
      accent: 'text-terminal-accent',
      text: 'text-terminal-text',
      body: 'text-terminal-body',
      muted: 'text-terminal-muted',
      faint: 'text-terminal-faint',
    })
  })

  it('names only utilities the theme really defines, spelled out so Tailwind emits them', () => {
    const colours = Object.keys(colourClass) as readonly Colour[]
    expect(colours.filter((colour) => tokenHex(colour) === undefined)).toEqual([])
  })

  it('reaches the exact hex the design tokens specify through those utilities', () => {
    expect({
      accent: tokenHex('accent'),
      text: tokenHex('text'),
      body: tokenHex('body'),
      muted: tokenHex('muted'),
      faint: tokenHex('faint'),
    }).toEqual({
      accent: '#ffb020',
      text: '#ece8df',
      body: '#b8b3a8',
      muted: '#8a867d',
      faint: '#5a574f',
    })
  })

  it('cannot be repainted at runtime, so one screen never disagrees with another', () => {
    expect(Object.isFrozen(colourClass)).toBe(true)
  })
})

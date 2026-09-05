import { describe, expect, it } from 'vitest'
import { mountRealDisk } from '#tests/helpers/disk'
import { invocation } from '#tests/helpers/invocation'
import { coloursOf, indentsOf, textOf } from '#tests/helpers/rows'
import { stack } from '@/apps/stack/stack'

const volume = await mountRealDisk()

const tools = stack.run(invocation('stack'), volume)

describe('stack', () => {
  it('names every layer the author works at, values aligned in one column', () => {
    expect(textOf(tools)).toEqual([
      'languages  typescript · php · python · java',
      'frontend   react · vue · nuxt · next',
      'backend    node · laravel · django · spring',
      'data       postgres · mysql · mongodb · redis',
      'infra      docker · aws · vercel · ci/cd · linux',
      'platforms  shopify · odoo · moodle',
    ])
  })

  it('keeps the labels quieter than the tools they introduce', () => {
    expect(coloursOf(tools)).toEqual([
      ['muted', 'body'],
      ['muted', 'body'],
      ['muted', 'body'],
      ['muted', 'body'],
      ['muted', 'body'],
      ['muted', 'body'],
    ])
  })

  it('drops each list of tools under its label, indented, when the screen is narrow', () => {
    expect(textOf(tools, 'narrow')).toEqual([
      'languages',
      'typescript · php · python · java',
      'frontend',
      'react · vue · nuxt · next',
      'backend',
      'node · laravel · django · spring',
      'data',
      'postgres · mysql · mongodb · redis',
      'infra',
      'docker · aws · vercel · ci/cd · linux',
      'platforms',
      'shopify · odoo · moodle',
    ])
    expect(indentsOf(tools, 'narrow')).toEqual([
      '0',
      '2ch',
      '0',
      '2ch',
      '0',
      '2ch',
      '0',
      '2ch',
      '0',
      '2ch',
      '0',
      '2ch',
    ])
  })

  it('only prints, so the terminal it runs in is left alone', () => {
    expect(tools.effects).toEqual([])
  })
})

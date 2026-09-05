import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('drops falsy values so a class can be written inline as a condition', () => {
    expect(cn('text-terminal-text', false && 'hidden', undefined, null, '')).toBe(
      'text-terminal-text',
    )
  })

  it('accepts arrays and objects the way callers spell conditional classes', () => {
    expect(cn(['flex', 'gap-2'], { 'text-terminal-accent': true, 'opacity-35': false })).toBe(
      'flex gap-2 text-terminal-accent',
    )
  })

  it('lets the later of two conflicting tailwind utilities win', () => {
    expect(cn('text-terminal-muted', 'text-terminal-accent')).toBe('text-terminal-accent')
  })

  it('returns an empty string when nothing is passed', () => {
    expect(cn()).toBe('')
  })
})

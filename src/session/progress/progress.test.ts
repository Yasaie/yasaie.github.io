import { describe, expect, it } from 'vitest'
import { countedNames, foundCount, isComplete, recordDiscovery, totalCounted } from './progress'

describe('the set of commands the game counts', () => {
  it('is the four worth naming plus the six a visitor has to find', () => {
    expect([...countedNames].toSorted()).toEqual([
      'coffee',
      'contact',
      'hire',
      'ps',
      'stack',
      'sudo',
      'tabriz',
      'vim',
      'whoami',
      'work',
    ])
  })

  it('is ten, which is the number the status line promises', () => {
    expect(totalCounted).toBe(10)
  })
})

describe('crediting a command a visitor has run', () => {
  it('remembers it so the status line can count it', () => {
    expect(recordDiscovery([], 'whoami')).toEqual({ discovered: ['whoami'], completed: false })
  })

  it('credits the command an alias stands for, not the alias itself', () => {
    expect(recordDiscovery([], 'cv').discovered).toEqual(['work'])
    expect(recordDiscovery([], 'hi').discovered).toEqual(['contact'])
  })

  it('counts the same command twice as one discovery, whichever name it was typed under', () => {
    expect(recordDiscovery(['work'], 'cv').discovered).toEqual(['work'])
  })

  it('ignores a command that is not part of the game', () => {
    expect(recordDiscovery([], 'ls').discovered).toEqual([])
    expect(recordDiscovery([], 'reboot').discovered).toEqual([])
  })

  it('ignores a command that is not installed at all', () => {
    expect(recordDiscovery([], 'sl').discovered).toEqual([])
  })

  it('announces completion on the ninth discovery and never again', () => {
    const eight = countedNames.slice(0, -1)
    const last = countedNames.at(-1) ?? ''
    expect(recordDiscovery(eight, last).completed).toBe(true)
    expect(recordDiscovery(countedNames, last).completed).toBe(false)
  })

  it('does not announce completion while anything is still unfound', () => {
    expect(recordDiscovery([], 'whoami').completed).toBe(false)
  })
})

describe('reading progress back', () => {
  it('counts what has been found and knows when nothing is left', () => {
    expect(foundCount(['whoami', 'work'])).toBe(2)
    expect(isComplete(['whoami', 'work'])).toBe(false)
    expect(isComplete(countedNames)).toBe(true)
  })
})

import { describe, expect, it } from 'vitest'
import { parse } from '@/kernel/parse/parse'

describe('parse, when there is nothing to run', () => {
  it('reads an empty line as blank, so pressing enter runs nothing', () => {
    expect(parse('', '~')).toEqual({ kind: 'blank' })
  })

  it('reads a line of nothing but spaces as blank', () => {
    expect(parse('   ', '~')).toEqual({ kind: 'blank' })
  })

  it('reads a line of nothing but a tab as blank', () => {
    expect(parse('\t', '~')).toEqual({ kind: 'blank' })
  })
})

describe('parse, reading a command line', () => {
  it('reads the first word as the program to run', () => {
    expect(parse('whoami', '~')).toEqual({
      kind: 'invocation',
      invocation: { name: 'whoami', args: [], raw: 'whoami', cwd: '~' },
    })
  })

  it('reads every word after the first as an argument', () => {
    expect(parse('ls -la work', '~')).toMatchObject({
      invocation: { name: 'ls', args: ['-la', 'work'] },
    })
  })

  it('lowercases the program name, because a shell command is not shouted', () => {
    expect(parse('WhoAmI', '~')).toMatchObject({ invocation: { name: 'whoami' } })
  })

  it('leaves an argument exactly as it was typed, since a path is case sensitive', () => {
    expect(parse('cat WhoAmI.TXT', '~')).toMatchObject({ invocation: { args: ['WhoAmI.TXT'] } })
  })

  it('ignores the space a visitor leaves either side of the line', () => {
    expect(parse('  ls -la  ', '~')).toMatchObject({
      invocation: { name: 'ls', args: ['-la'], raw: 'ls -la' },
    })
  })

  it('treats any run of whitespace between words as one separator', () => {
    expect(parse('work    3', '~')).toMatchObject({ invocation: { name: 'work', args: ['3'] } })
  })

  it('remembers the line as typed, so the echo reads back what was entered', () => {
    expect(parse('  work 3 ', '~')).toMatchObject({ invocation: { raw: 'work 3' } })
  })

  it('carries the directory the visitor is standing in, so an app can resolve a path', () => {
    expect(parse('ls', '~/work')).toMatchObject({ invocation: { cwd: '~/work' } })
  })

  it('hands back arguments nothing downstream can rewrite', () => {
    const parsed = parse('ls -la', '~')
    expect(parsed.kind === 'invocation' && Object.isFrozen(parsed.invocation.args)).toBe(true)
  })
})

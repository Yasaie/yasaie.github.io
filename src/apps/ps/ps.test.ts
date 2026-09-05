import { describe, expect, it } from 'vitest'
import { mountRealDisk } from '#tests/helpers/disk'
import { invocation } from '#tests/helpers/invocation'
import { coloursOf, textOf } from '#tests/helpers/rows'
import { ps } from '@/apps/ps/ps'
import { execute } from '@/kernel/execute/execute'

const volume = await mountRealDisk()

const running = ps.run(invocation('ps'), volume)

describe('ps', () => {
  it('shows what is open on the machine, which is what the hours go on', () => {
    expect(textOf(running).slice(1, -2)).toEqual([
      '  418  Lightroom',
      '  902  VLC',
      ' 1173  BoardGameGeek',
    ])
  })

  it('gives snooker no pid, because that one does not run on a computer', () => {
    expect(textOf(running).at(-2)).toBe('    -  snooker')
  })

  it('heads the listing the way a process table is headed', () => {
    expect(textOf(running).at(0)).toBe('  PID  CMD')
    expect(coloursOf(running).at(0)).toEqual(['muted'])
  })

  it('counts itself among what is running, because a listing is a process too', () => {
    expect(textOf(running).at(-1)).toBe(' 2201  ps')
  })

  it('reports itself under the name it was called by, so top lists top', () => {
    expect(textOf(execute(invocation('top'), volume)).at(-1)).toBe(' 2201  top')
  })

  it('puts every command in the column the header names', () => {
    const [header = '', ...rows] = textOf(running)
    const column = header.indexOf('CMD')
    const misaligned = rows.filter((row) => row[column] === ' ' || row[column - 1] !== ' ')
    expect(misaligned).toEqual([])
  })

  it('only prints, so the terminal it runs in is left alone', () => {
    expect(running.effects).toEqual([])
  })
})

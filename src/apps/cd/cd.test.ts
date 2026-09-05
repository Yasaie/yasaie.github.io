import { describe, expect, it } from 'vitest'
import { cd } from '@/apps/cd/cd'
import { mountRealDisk } from '@/testing/disk/disk'
import { invocation } from '@/testing/invocation/invocation'
import { coloursOf, textOf } from '@/testing/rows/rows'

const volume = await mountRealDisk()

describe('cd', () => {
  it('goes home when told nothing, printing nothing on the way', () => {
    const arrival = cd.run(invocation('cd', '~/work'), volume)
    expect(arrival.effects).toEqual([{ kind: 'changeDirectory', cwd: '~' }])
    expect(textOf(arrival)).toEqual([])
  })

  it('accepts every spelling of the two directories a visitor may stand in', () => {
    const intoWork = [{ kind: 'changeDirectory', cwd: '~/work' }]
    expect(cd.run(invocation('cd work'), volume).effects).toEqual(intoWork)
    expect(cd.run(invocation('cd work/'), volume).effects).toEqual(intoWork)
    expect(cd.run(invocation('cd ~/work'), volume).effects).toEqual(intoWork)
    expect(cd.run(invocation('cd ~'), volume).effects).toEqual([
      { kind: 'changeDirectory', cwd: '~' },
    ])
  })

  it('climbs out of the work directory back to home', () => {
    expect(cd.run(invocation('cd ..', '~/work'), volume).effects).toEqual([
      { kind: 'changeDirectory', cwd: '~' },
    ])
  })

  it('refuses everything above home, whether or not it is really there', () => {
    const denied = cd.run(invocation('cd ..'), volume)
    expect(textOf(denied)).toEqual(['cd: permission denied: ..'])
    expect(coloursOf(denied)).toEqual([['muted']])
    expect(textOf(cd.run(invocation('cd /home'), volume))).toEqual(['cd: permission denied: /home'])
    expect(textOf(cd.run(invocation('cd /'), volume))).toEqual(['cd: permission denied: /'])
    expect(textOf(cd.run(invocation('cd /root'), volume))).toEqual(['cd: permission denied: /root'])
  })

  it('will not step into a document, present or absent', () => {
    expect(textOf(cd.run(invocation('cd whoami.txt'), volume))).toEqual([
      'cd: not a directory: whoami.txt',
    ])
    expect(textOf(cd.run(invocation('cd nowhere.md'), volume))).toEqual([
      'cd: not a directory: nowhere.md',
    ])
  })

  it('repeats the argument exactly as typed when there is nothing to enter', () => {
    expect(textOf(cd.run(invocation('cd Nowhere'), volume))).toEqual([
      'cd: no such file or directory: Nowhere',
    ])
  })

  it('never prints when it succeeds, and never moves when it fails', () => {
    expect(textOf(cd.run(invocation('cd work'), volume))).toEqual([])
    expect(cd.run(invocation('cd Nowhere'), volume).effects).toEqual([])
  })
})

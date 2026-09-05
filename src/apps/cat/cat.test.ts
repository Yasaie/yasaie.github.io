import { describe, expect, it } from 'vitest'
import { execute } from '@/kernel/execute/execute'
import { mountRealDisk } from '@/test/disk/disk'
import { invocation } from '@/test/invocation/invocation'
import { coloursOf, textOf } from '@/test/rows/rows'

const volume = await mountRealDisk()

describe('cat', () => {
  it('asks which file, in the name the visitor actually typed', () => {
    const asked = execute(invocation('cat'), volume)
    expect(textOf(asked)).toEqual(['cat: which file?'])
    expect(coloursOf(asked)).toEqual([['muted']])
    expect(textOf(execute(invocation('less'), volume))).toEqual(['less: which file?'])
  })

  it('prints exactly what the command behind a document would print, and nothing more', () => {
    const printed = execute(invocation('cat whoami.txt'), volume)
    expect(textOf(printed)).toEqual(textOf(execute(invocation('whoami'), volume)))
  })

  it('records which app it handed the document to, so the visitor is credited for finding it', () => {
    const printed = execute(invocation('cat whoami.txt'), volume)
    expect(printed.effects).toEqual([
      { kind: 'delegate', name: 'whoami', args: ['/home/payam/eindhoven/whoami.txt'] },
    ])
  })

  it('finds a document by any name that points at it, from either directory', () => {
    const stack = textOf(execute(invocation('stack'), volume))
    const contact = textOf(execute(invocation('contact'), volume))
    const whoami = textOf(execute(invocation('whoami'), volume))
    expect(textOf(execute(invocation('cat stack'), volume))).toEqual(stack)
    expect(textOf(execute(invocation('cat ./stack.txt'), volume))).toEqual(stack)
    expect(textOf(execute(invocation('cat ~/contact'), volume))).toEqual(contact)
    expect(textOf(execute(invocation('cat WHOAMI.TXT'), volume))).toEqual(whoami)
    expect(textOf(execute(invocation('cat ../whoami', '~/work'), volume))).toEqual(whoami)
  })

  it('opens a work chapter however the visitor points at it', () => {
    const chapter = textOf(execute(invocation('work 3'), volume))
    expect(textOf(execute(invocation('cat work/3'), volume))).toEqual(chapter)
    expect(textOf(execute(invocation('cat 3', '~/work'), volume))).toEqual(chapter)
    expect(textOf(execute(invocation('cat 3-tas-hil-gostar.md', '~/work'), volume))).toEqual(
      chapter,
    )
  })

  it('will not guess when the name could mean more than one thing', () => {
    expect(textOf(execute(invocation('cat w'), volume))).toEqual([
      'cat: w: no such file or directory',
    ])
  })

  it('refuses the sealed file rather than pretending it is not there', () => {
    const refusal = execute(invocation('cat .secrets'), volume)
    expect(textOf(refusal)).toEqual(['cat: .secrets: permission denied'])
    expect(coloursOf(refusal)).toEqual([['muted']])
  })

  it('dumps a file no program renders, line for line as the disk holds it', () => {
    const dumped = execute(invocation('cat /etc/os-release'), volume)
    expect(textOf(dumped)).toEqual([
      'name=Payam Yasaie',
      'role=senior software engineer',
      'at=GoodHabitz',
      'where=Eindhoven, NL',
      'uptime=16 years',
      'shell=zsh',
      'langs=ts · php · py · java',
    ])
    expect(coloursOf(dumped)).toEqual([
      ['body'],
      ['body'],
      ['body'],
      ['body'],
      ['body'],
      ['body'],
      ['body'],
    ])
  })

  it('says a directory is a directory instead of claiming it does not exist', () => {
    expect(textOf(execute(invocation('cat work'), volume))).toEqual(['cat: work: is a directory'])
  })

  it('repeats the argument exactly as typed when it cannot find it', () => {
    expect(textOf(execute(invocation('cat Nowhere'), volume))).toEqual([
      'cat: Nowhere: no such file or directory',
    ])
    expect(textOf(execute(invocation('cat nowhere/'), volume))).toEqual([
      'cat: nowhere/: no such file or directory',
    ])
    expect(textOf(execute(invocation('cat nowhere/whoami'), volume))).toEqual([
      'cat: nowhere/whoami: no such file or directory',
    ])
    expect(textOf(execute(invocation('cat whoami.txt/whoami'), volume))).toEqual([
      'cat: whoami.txt/whoami: no such file or directory',
    ])
  })

  it('answers to the other names a shell reader reaches for', () => {
    const stack = textOf(execute(invocation('stack'), volume))
    expect(textOf(execute(invocation('more stack.txt'), volume))).toEqual(stack)
    expect(textOf(execute(invocation('head stack.txt'), volume))).toEqual(stack)
    expect(textOf(execute(invocation('tail stack.txt'), volume))).toEqual(stack)
  })
})

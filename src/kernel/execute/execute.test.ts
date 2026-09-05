import { beforeAll, describe, expect, it, vi } from 'vitest'
import { mountRealDisk } from '#tests/helpers/disk'
import { invocation } from '#tests/helpers/invocation'
import { textOf } from '#tests/helpers/rows'
import type { Volume } from '@/fs/volume/volume'
import type { App } from '@/kernel/contract/contract'
import { execute } from '@/kernel/execute/execute'

vi.mock('@/kernel/registry/registry', async (importOriginal) => {
  const real = await importOriginal<typeof import('@/kernel/registry/registry')>()
  const { text } = await import('@/tty/line/line')
  const passingTo = (name: string, next: string): App => ({
    name,
    aliases: [],
    summary: `${name} passes the line on`,
    listed: null,
    counted: false,
    handles: [],
    run: () => ({
      lines: [text(`${name} ran`, 'body')],
      effects: [{ kind: 'delegate', name: next, args: [] }],
    }),
  })
  const chain = Array.from({ length: 30 }, (_, index) =>
    passingTo(`chain-${index}`, `chain-${index + 1}`),
  )
  const synthetic = new Map<string, App>([
    ['ping', passingTo('ping', 'pong')],
    ['pong', passingTo('pong', 'ping')],
    ...chain.map((app) => [app.name, app] as const),
  ])
  return {
    ...real,
    routeApp: (name: string) =>
      name === 'uninstalled' ? undefined : (synthetic.get(name) ?? real.routeApp(name)),
  }
})

let volume: Volume

beforeAll(async () => {
  volume = await mountRealDisk()
})

const run = (line: string, cwd: '~' | '~/work' = '~') => execute(invocation(line, cwd), volume)

describe('execute, dispatching a typed line', () => {
  it('runs the app that answers to the name that was typed', () => {
    expect(textOf(run('pwd'))).toEqual(['/home/payam/eindhoven'])
  })

  it('runs the same app whichever of its names was typed', () => {
    expect(textOf(run('cv'))).toEqual(textOf(run('work')))
    expect(textOf(run('history'))).toEqual(textOf(run('work')))
  })

  it('hands the app the arguments that followed the name', () => {
    expect(textOf(run('work 3'))[0]).toBe("2019 – 2021  Tas'hil Gostar")
  })

  it('hands the app the directory the visitor is standing in', () => {
    expect(textOf(run('pwd', '~/work'))).toEqual(['/home/payam/eindhoven/work'])
  })

  it('answers for a program nobody installed without naming it in the kernel', () => {
    expect(textOf(run('sl'))).toEqual(['zsh: command not found: sl'])
  })

  it('says nothing at all when no app volunteers to answer for the rest', () => {
    expect(run('uninstalled')).toEqual({ lines: [], effects: [] })
  })

  it('leaves the echo line and the trailing blank to the session', () => {
    const printed = textOf(run('whoami'))
    expect(printed[0]).toBe('Payam Yasaie')
    expect(printed.at(-1)).not.toBe('')
  })
})

describe('execute, carrying what an app returns', () => {
  it('passes an effect the app asked for straight through to the host', () => {
    expect(run('cd work').effects).toEqual([{ kind: 'changeDirectory', cwd: '~/work' }])
  })

  it('passes the speed an app prints at through to the host', () => {
    expect(run('reboot').speedMs).toBe(120)
  })

  it('leaves the speed unstated when the app has no opinion about it', () => {
    expect(run('pwd').speedMs).toBeUndefined()
  })
})

describe('execute, following a delegation', () => {
  it('prints what the delegated app prints, so cat need not know how to render', () => {
    expect(textOf(run('cat whoami.txt'))).toEqual(textOf(run('whoami')))
  })

  it('keeps the delegation on the output, so the host knows which app really ran', () => {
    expect(run('cat whoami.txt').effects).toEqual([
      { kind: 'delegate', name: 'whoami', args: ['/home/payam/eindhoven/whoami.txt'] },
    ])
  })

  it('prints the delegating app before the app it delegated to', () => {
    expect(textOf(run('ping'))[0]).toBe('ping ran')
    expect(textOf(run('ping'))[1]).toBe('pong ran')
  })

  it('returns rather than looping when two apps delegate to each other', () => {
    expect(new Set(textOf(run('ping')))).toEqual(new Set(['ping ran', 'pong ran']))
  })

  it('cuts a chain of delegations short instead of following it to the end', () => {
    const printed = textOf(run('chain-0'))
    expect(printed[0]).toBe('chain-0 ran')
    expect(printed).not.toContain('chain-29 ran')
  })

  it('drops the delegation it refused to follow rather than running it elsewhere', () => {
    expect(textOf(run('chain-0')).filter((line) => line.startsWith('zsh:'))).toEqual([])
  })
})

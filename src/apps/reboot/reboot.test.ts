import { describe, expect, it } from 'vitest'
import { mountRealDisk } from '#tests/helpers/disk'
import { invocation } from '#tests/helpers/invocation'
import { coloursOf, textOf } from '#tests/helpers/rows'
import { reboot } from '@/apps/reboot/reboot'
import { execute } from '@/kernel/execute/execute'

const volume = await mountRealDisk()

const shutdown = reboot.run(invocation('reboot'), volume)

describe('reboot', () => {
  it('narrates a shutdown before it schedules the machine coming back', () => {
    expect(textOf(shutdown)).toEqual([
      'broadcast message: the system is going down for reboot now',
      '',
      '[  ok  ] stopped nothing in particular',
      '[  ok  ] unmounted everything since 2010',
      '[  ok  ] reached target power-off',
    ])
  })

  it('keeps the broadcast quieter than the status lines that follow it', () => {
    expect(coloursOf(shutdown)).toEqual([['body'], [], ['muted'], ['muted'], ['muted']])
  })

  it('schedules the power-off to replay the boot splash, and prints slower than normal output', () => {
    expect(shutdown.effects).toEqual([{ kind: 'reboot', delayMs: 1400 }])
    expect(shutdown.speedMs).toBe(120)
  })

  it('answers to restart and shutdown as well as to its own name', () => {
    expect(textOf(execute(invocation('restart'), volume))).toEqual(textOf(shutdown))
    expect(textOf(execute(invocation('shutdown'), volume))).toEqual(textOf(shutdown))
  })
})

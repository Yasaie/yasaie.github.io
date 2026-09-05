import { describe, expect, it } from 'vitest'
import type { Effect, EffectHandlers } from '@/kernel/effects/effects'
import { applyEffect, isDelegation } from '@/kernel/effects/effects'

const clear: Effect = { kind: 'clear' }
const changeDirectory: Effect = { kind: 'changeDirectory', cwd: '~/work' }
const reboot: Effect = { kind: 'reboot', delayMs: 1400 }
const delegate: Effect = { kind: 'delegate', name: 'whoami', args: ['/home/payam/eindhoven'] }

const naming: EffectHandlers<string> = {
  clear: () => 'wiped the screen',
  changeDirectory: (effect) => `walked to ${effect.cwd}`,
  reboot: (effect) => `going down in ${effect.delayMs}ms`,
  delegate: (effect) => `ran ${effect.name} on ${effect.args.join(' ')}`,
}

describe('applyEffect', () => {
  it('hands a clear to the handler that wipes the screen', () => {
    expect(applyEffect(naming, clear)).toBe('wiped the screen')
  })

  it('hands a change of directory to its handler with the directory to walk to', () => {
    expect(applyEffect(naming, changeDirectory)).toBe('walked to ~/work')
  })

  it('hands a reboot to its handler with the delay before the replay', () => {
    expect(applyEffect(naming, reboot)).toBe('going down in 1400ms')
  })

  it('hands a delegation to its handler with the app and the arguments to run it on', () => {
    expect(applyEffect(naming, delegate)).toBe('ran whoami on /home/payam/eindhoven')
  })

  it('lets a host answer every effect from one keyed table rather than a chain of tests', () => {
    const effects: readonly Effect[] = [clear, changeDirectory, reboot, delegate]
    expect(effects.map((effect) => applyEffect(naming, effect))).toEqual([
      'wiped the screen',
      'walked to ~/work',
      'going down in 1400ms',
      'ran whoami on /home/payam/eindhoven',
    ])
  })
})

describe('isDelegation', () => {
  it('recognises the one effect that asks another app to answer', () => {
    expect(isDelegation(delegate)).toBe(true)
  })

  it('leaves every other effect for the host to apply itself', () => {
    expect([clear, changeDirectory, reboot].map(isDelegation)).toEqual([false, false, false])
  })
})

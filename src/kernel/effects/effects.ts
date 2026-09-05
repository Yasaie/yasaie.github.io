import type { Cwd } from '@/fs/path/path'

export type Effect =
  | { readonly kind: 'clear' }
  | { readonly kind: 'changeDirectory'; readonly cwd: Cwd }
  | { readonly kind: 'reboot'; readonly delayMs: number }
  | { readonly kind: 'delegate'; readonly name: string; readonly args: readonly string[] }

export type Delegation = Extract<Effect, { readonly kind: 'delegate' }>

export type EffectHandlers<Result> = {
  readonly [Kind in Effect['kind']]: (effect: Extract<Effect, { readonly kind: Kind }>) => Result
}

export const isDelegation = (effect: Effect): effect is Delegation => effect.kind === 'delegate'

export const applyEffect = <Result>(handlers: EffectHandlers<Result>, effect: Effect): Result => {
  switch (effect.kind) {
    case 'clear':
      return handlers.clear(effect)
    case 'changeDirectory':
      return handlers.changeDirectory(effect)
    case 'reboot':
      return handlers.reboot(effect)
    case 'delegate':
      return handlers.delegate(effect)
  }
}

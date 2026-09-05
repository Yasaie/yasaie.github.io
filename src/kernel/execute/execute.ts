import type { Volume } from '@/fs/volume/volume'
import type { Invocation, Output } from '@/kernel/app/app'
import type { Delegation, Effect } from '@/kernel/effects/effects'
import { isDelegation } from '@/kernel/effects/effects'
import { routeApp } from '@/kernel/registry/registry'

const maxDepth = 8

const silence: Output = Object.freeze({ lines: [], effects: [] })

const speed = (millis: number | undefined): Pick<Output, 'speedMs'> =>
  millis === undefined ? {} : { speedMs: millis }

const firstSpeed = (outputs: readonly Output[]): number | undefined =>
  outputs.find((output) => output.speedMs !== undefined)?.speedMs

const withoutDelegations = (output: Output): Output => ({
  ...output,
  effects: output.effects.filter((effect: Effect) => !isDelegation(effect)),
})

type Expansion = { readonly effect: Effect; readonly output: Output }

const invocationFor = (delegation: Delegation, from: Invocation): Invocation => ({
  name: delegation.name,
  args: delegation.args,
  raw: [delegation.name, ...delegation.args].join(' '),
  cwd: from.cwd,
})

const dispatch = (invocation: Invocation, volume: Volume, depth: number): Output => {
  const app = routeApp(invocation.name)
  if (app === undefined) return silence
  const output = app.run(invocation, volume)
  if (depth === 0) return withoutDelegations(output)
  const expand = (effect: Effect): Expansion => ({
    effect,
    output: isDelegation(effect)
      ? dispatch(invocationFor(effect, invocation), volume, depth - 1)
      : silence,
  })
  const expansions = output.effects.map(expand)
  const followed = expansions.map((expansion) => expansion.output)
  return {
    lines: [...output.lines, ...followed.flatMap((each) => each.lines)],
    effects: expansions.flatMap(({ effect, output: each }) => [effect, ...each.effects]),
    ...speed(output.speedMs ?? firstSpeed(followed)),
  }
}

export const execute = (invocation: Invocation, volume: Volume): Output =>
  dispatch(invocation, volume, maxDepth)

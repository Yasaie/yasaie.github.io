import { canonicalNameOf, countedApps } from '@/kernel/registry/registry'

export type Discovery = {
  readonly discovered: readonly string[]
  readonly completed: boolean
}

export const countedNames: readonly string[] = Object.freeze(countedApps.map((app) => app.name))

const counted: ReadonlySet<string> = new Set(countedNames)

export const totalCounted = countedNames.length

export const foundCount = (discovered: readonly string[]): number => discovered.length

export const isComplete = (discovered: readonly string[]): boolean =>
  foundCount(discovered) === totalCounted

export const recordDiscovery = (discovered: readonly string[], command: string): Discovery => {
  const name = canonicalNameOf(command)
  if (name === undefined || !counted.has(name) || discovered.includes(name))
    return { discovered, completed: false }
  const found = [...discovered, name]
  return { discovered: found, completed: isComplete(found) }
}

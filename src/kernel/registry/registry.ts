import type { App } from '@/kernel/app/app'

const anyName = '*'

export type Registry = {
  readonly installed: readonly App[]
  readonly listed: readonly App[]
  readonly counted: readonly App[]
  readonly find: (name: string) => App | undefined
  readonly route: (name: string) => App | undefined
  readonly canonicalName: (name: string) => string | undefined
  readonly handling: (path: string) => App | undefined
}

const fail: (folder: string, reason: string) => never = (folder, reason) => {
  throw new Error(`app "${folder}" ${reason}`)
}

const segmentsOf = (modulePath: string): readonly string[] => modulePath.split('/')

const folderOf = (modulePath: string): string => segmentsOf(modulePath).at(-2) ?? ''

const moduleNameOf = (modulePath: string): string =>
  (segmentsOf(modulePath).at(-1) ?? '').replace(/\.ts$/, '')

const isStringList = (value: unknown): value is readonly string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const isApp = (value: unknown): value is App => {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.name === 'string' &&
    isStringList(candidate.aliases) &&
    typeof candidate.summary === 'string' &&
    (candidate.listed === null || typeof candidate.listed === 'number') &&
    typeof candidate.counted === 'boolean' &&
    isStringList(candidate.handles) &&
    typeof candidate.run === 'function'
  )
}

const appOf = (modulePath: string, module: unknown): App => {
  const folder = folderOf(modulePath)
  const exported = Object.values(module as Record<string, unknown>)
  const [only] = exported
  if (exported.length !== 1) fail(folder, `must export one value, it exports ${exported.length}`)
  if (!isApp(only)) fail(folder, 'does not export a value satisfying App')
  if (only.name !== folder) fail(folder, `calls itself "${only.name}"`)
  return only
}

const discover = (modules: Readonly<Record<string, unknown>>): readonly App[] =>
  Object.freeze(
    Object.entries(modules)
      .filter(([modulePath]) => moduleNameOf(modulePath) === folderOf(modulePath))
      .toSorted(([left], [right]) => (left < right ? -1 : 1))
      .map(([modulePath, module]) => appOf(modulePath, module)),
  )

const claim = (index: Map<string, App>, name: string, app: App): Map<string, App> => {
  const taken = index.get(name)
  if (taken !== undefined) fail(app.name, `claims "${name}", already taken by "${taken.name}"`)
  return index.set(name, app)
}

const indexBy = (
  apps: readonly App[],
  keys: (app: App) => readonly string[],
): ReadonlyMap<string, App> =>
  apps.reduce(
    (index, app) => keys(app).reduce((taken, key) => claim(taken, key, app), index),
    new Map<string, App>(),
  )

export const registryOf = (modules: Readonly<Record<string, unknown>>): Registry => {
  const installed = discover(modules)
  const byName = indexBy(installed, (app) => [app.name, ...app.aliases])
  const byHandledPath = indexBy(installed, (app) => app.handles)
  return Object.freeze({
    installed,
    listed: Object.freeze(
      installed
        .map((app) => [app, app.listed] as const)
        .filter((placed): placed is readonly [App, number] => placed[1] !== null)
        .toSorted(([, left], [, right]) => left - right)
        .map(([app]) => app),
    ),
    counted: Object.freeze(installed.filter((app) => app.counted)),
    find: (name: string) => byName.get(name),
    route: (name: string) => byName.get(name) ?? byName.get(anyName),
    canonicalName: (name: string) => byName.get(name)?.name,
    handling: (path: string) => byHandledPath.get(path),
  })
}

const installedRegistry = registryOf(
  import.meta.glob(['/src/apps/*/*.ts', '!/src/apps/*/*.test.ts'], { eager: true }),
)

export const installedApps = installedRegistry.installed
export const listedApps = installedRegistry.listed
export const countedApps = installedRegistry.counted
export const findApp = installedRegistry.find
export const routeApp = installedRegistry.route
export const canonicalNameOf = installedRegistry.canonicalName
export const appHandling = installedRegistry.handling

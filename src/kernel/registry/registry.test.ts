import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { App } from '@/kernel/contract/contract'
import {
  appHandling,
  canonicalNameOf,
  countedApps,
  installedApps,
  listedApps,
  registryOf,
  routeApp,
} from '@/kernel/registry/registry'

const appFolders: readonly string[] = readdirSync(join(process.cwd(), 'src', 'apps'), {
  withFileTypes: true,
})
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .toSorted()

const anApp = (name: string, extra: Partial<App> = {}): App => ({
  name,
  aliases: [],
  summary: `summary of ${name}`,
  listed: null,
  counted: false,
  handles: [],
  run: () => ({ lines: [], effects: [] }),
  ...extra,
})

const modulesOf = (apps: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> =>
  Object.fromEntries(
    Object.entries(apps).map(([folder, module]) => [`/src/apps/${folder}/${folder}.ts`, module]),
  )

const installing = (apps: Readonly<Record<string, unknown>>) => () => registryOf(modulesOf(apps))

describe('discovery', () => {
  it('installs one app for every folder on disk, so a new folder needs no registration', () => {
    expect(installedApps.map((app) => app.name).toSorted()).toEqual(appFolders)
  })

  it('leaves no folder uninstalled, which is what makes deleting one an uninstall', () => {
    expect(installedApps).toHaveLength(appFolders.length)
  })

  it('ignores a module that sits outside any app folder, since nothing owns it', () => {
    const registry = registryOf({ 'ls.ts': { ls: anApp('ls') } })

    expect(registry.installed).toEqual([])
  })

  it('installs only the module named after its folder', () => {
    const registry = registryOf({
      '/src/apps/ls/ls.ts': { ls: anApp('ls') },
      '/src/apps/ls/columns.ts': { columns: 'not an app at all' },
    })
    expect(registry.installed.map((app) => app.name)).toEqual(['ls'])
  })

  it('installs apps in a fixed order however the module map is enumerated', () => {
    const forwards = registryOf(
      modulesOf({ pwd: { pwd: anApp('pwd') }, cat: { cat: anApp('cat') } }),
    )
    const backwards = registryOf(
      modulesOf({ cat: { cat: anApp('cat') }, pwd: { pwd: anApp('pwd') } }),
    )
    expect(forwards.installed.map((app) => app.name)).toEqual(['cat', 'pwd'])
    expect(backwards.installed.map((app) => app.name)).toEqual(['cat', 'pwd'])
  })

  it('hands back a list of apps nothing can install into afterwards', () => {
    expect(Object.isFrozen(installedApps)).toBe(true)
  })
})

describe('discovery, when a folder is not a working app', () => {
  it('names the folder whose module exports nothing', () => {
    expect(installing({ ls: {} })).toThrow('app "ls" must export one value, it exports 0')
  })

  it('names the folder whose module exports more than the app', () => {
    expect(installing({ ls: { ls: anApp('ls'), columns: 3 } })).toThrow(
      'app "ls" must export one value, it exports 2',
    )
  })

  it('names the folder whose export is not an app', () => {
    expect(installing({ ls: { ls: 'ls' } })).toThrow(
      'app "ls" does not export a value satisfying App',
    )
  })

  it('refuses an app that is missing a field of the contract', () => {
    const withoutHandles = {
      name: 'ls',
      aliases: [],
      summary: 'list directory contents',
      listed: null,
      counted: false,
      run: () => ({ lines: [], effects: [] }),
    }
    expect(installing({ ls: { ls: withoutHandles } })).toThrow(
      'app "ls" does not export a value satisfying App',
    )
  })

  it('refuses an app whose aliases are not all names', () => {
    expect(
      installing({ ls: { ls: anApp('ls', { aliases: ['dir', 7] as unknown as string[] }) } }),
    ).toThrow('app "ls" does not export a value satisfying App')
  })

  it('refuses an app that is not an object at all', () => {
    expect(installing({ ls: { ls: null } })).toThrow(
      'app "ls" does not export a value satisfying App',
    )
  })

  it('refuses an app whose listing position is neither a number nor unlisted', () => {
    expect(installing({ ls: { ls: anApp('ls', { listed: '1' as unknown as number }) } })).toThrow(
      'app "ls" does not export a value satisfying App',
    )
  })

  it('refuses an app that gives itself no name', () => {
    expect(installing({ ls: { ls: anApp('ls', { name: 7 as unknown as string }) } })).toThrow(
      'app "ls" does not export a value satisfying App',
    )
  })

  it('refuses an app that offers no summary for the listing', () => {
    expect(installing({ ls: { ls: anApp('ls', { summary: null as unknown as string }) } })).toThrow(
      'app "ls" does not export a value satisfying App',
    )
  })

  it('refuses an app that will not say whether it counts toward the nine', () => {
    expect(
      installing({ ls: { ls: anApp('ls', { counted: 'yes' as unknown as boolean }) } }),
    ).toThrow('app "ls" does not export a value satisfying App')
  })

  it('refuses an app whose handled paths are not all paths', () => {
    expect(
      installing({ ls: { ls: anApp('ls', { handles: [7] as unknown as string[] }) } }),
    ).toThrow('app "ls" does not export a value satisfying App')
  })

  it('refuses an app that cannot be run', () => {
    expect(
      installing({ ls: { ls: anApp('ls', { run: 'later' as unknown as App['run'] }) } }),
    ).toThrow('app "ls" does not export a value satisfying App')
  })

  it('names the folder whose app calls itself something else', () => {
    expect(installing({ ls: { ls: anApp('dir') } })).toThrow('app "ls" calls itself "dir"')
  })

  it('fails at mount rather than letting the app disappear from the listing', () => {
    expect(installing({ ls: { ls: 'ls' }, pwd: { pwd: anApp('pwd') } })).toThrow()
  })
})

describe('the name index', () => {
  it('finds every installed app by the name it calls itself', () => {
    const missed = installedApps.filter((app) => routeApp(app.name) !== app)
    expect(missed.map((app) => app.name)).toEqual([])
  })

  it('finds every installed app by each alias it answers to', () => {
    const missed = installedApps.flatMap((app) =>
      app.aliases.filter((alias) => routeApp(alias) !== app),
    )
    expect(missed).toEqual([])
  })

  it('claims each name and alias exactly once across every installed app', () => {
    const claimed = installedApps.flatMap((app) => [app.name, ...app.aliases])
    expect(claimed.toSorted()).toEqual([...new Set(claimed)].toSorted())
  })

  it('names both apps when two of them claim the same word', () => {
    expect(
      installing({ ls: { ls: anApp('ls', { aliases: ['dir'] }) }, dir: { dir: anApp('dir') } }),
    ).toThrow('app "ls" claims "dir", already taken by "dir"')
  })

  it('refuses an app that claims a word another app already answers to', () => {
    expect(
      installing({
        cat: { cat: anApp('cat', { aliases: ['less'] }) },
        head: { head: anApp('head', { aliases: ['less'] }) },
      }),
    ).toThrow('app "head" claims "less", already taken by "cat"')
  })

  it('resolves an alias to the app it belongs to, so the game counts apps not words', () => {
    expect(canonicalNameOf('cv')).toBe('work')
    expect(canonicalNameOf('hi')).toBe('contact')
    expect(canonicalNameOf('?')).toBe('help')
  })

  it('resolves a canonical name to itself', () => {
    expect(canonicalNameOf('work')).toBe('work')
  })

  it('resolves nothing for a word no app claims', () => {
    expect(canonicalNameOf('rm')).toBeUndefined()
  })
})

describe('routing', () => {
  it('routes a typed word to the app that claims it', () => {
    expect(routeApp('cv')?.name).toBe('work')
  })

  it('routes a word no app claims to whichever app volunteered for the rest', () => {
    expect(routeApp('rm')?.name).toBe('not-found')
  })

  it('routes nothing anywhere when no app volunteered for the rest', () => {
    expect(registryOf(modulesOf({ pwd: { pwd: anApp('pwd') } })).route('rm')).toBeUndefined()
  })

  it('lets the volunteer be routed to by its own name as well', () => {
    const registry = registryOf(modulesOf({ pwd: { pwd: anApp('pwd', { aliases: ['*'] }) } }))
    expect(registry.route('pwd')?.name).toBe('pwd')
  })
})

describe('the listing', () => {
  it('orders the listed apps by the position each declares', () => {
    expect(listedApps.map((app) => app.listed)).toEqual(
      listedApps.map((app) => app.listed).toSorted((left, right) => (left ?? 0) - (right ?? 0)),
    )
  })

  it('gives each listed app a position of its own, so the listing never wobbles', () => {
    const positions = listedApps.map((app) => app.listed)
    expect(positions).toEqual([...new Set(positions)])
  })

  it('leaves out every app that declares no position', () => {
    expect(listedApps.every((app) => app.listed !== null)).toBe(true)
    expect(installedApps.filter((app) => app.listed !== null)).toHaveLength(listedApps.length)
  })

  it('orders a listing by position rather than by folder name', () => {
    const registry = registryOf(
      modulesOf({
        clear: { clear: anApp('clear', { listed: 5 }) },
        whoami: { whoami: anApp('whoami', { listed: 1 }) },
      }),
    )
    expect(registry.listed.map((app) => app.name)).toEqual(['whoami', 'clear'])
  })
})

describe('the counted set', () => {
  it('counts exactly the nine apps the game asks a visitor to find', () => {
    expect(countedApps.map((app) => app.name).toSorted()).toEqual([
      'coffee',
      'contact',
      'hire',
      'stack',
      'sudo',
      'tabriz',
      'vim',
      'whoami',
      'work',
    ])
  })

  it('counts nine apps, not nine words a visitor could type', () => {
    expect(countedApps).toHaveLength(9)
  })
})

describe('the handled-path index', () => {
  it('finds the app that renders a document, so cat need not name one', () => {
    expect(appHandling('/home/payam/eindhoven/whoami.txt')?.name).toBe('whoami')
  })

  it('finds the app that renders a work chapter', () => {
    expect(appHandling('/home/payam/eindhoven/work/3-tas-hil-gostar.md')?.name).toBe('work')
  })

  it('finds no app for a document nothing claims to render', () => {
    expect(appHandling('/etc/yasaie-release')).toBeUndefined()
  })

  it('refuses two apps that claim to render the same document', () => {
    expect(
      installing({
        cat: { cat: anApp('cat', { handles: ['/etc/issue'] }) },
        head: { head: anApp('head', { handles: ['/etc/issue'] }) },
      }),
    ).toThrow('app "head" claims "/etc/issue", already taken by "cat"')
  })
})

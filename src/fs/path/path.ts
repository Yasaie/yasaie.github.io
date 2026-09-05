import type { Volume, VolumeEntry } from '@/fs/volume/volume'

export type Cwd = '~' | '~/work'

export const homePath = '/home/payam/eindhoven'
export const workPath = `${homePath}/work`
export const parentOfHomePath = '/home/payam'

export const pathOf = (cwd: Cwd): string => (cwd === '~' ? homePath : workPath)

export const parentOf = (path: string): string => path.slice(0, path.lastIndexOf('/'))

export type Resolution =
  | { readonly kind: 'found'; readonly entry: VolumeEntry }
  | { readonly kind: 'notFound'; readonly target: string }

const extensions: readonly string[] = ['.txt', '.md']

const withoutTrailingSlash = (typed: string): string => typed.replace(/\/+$/, '')

const baseOf = (typed: string, cwd: Cwd): string =>
  typed.startsWith('/') ? '' : typed.startsWith('~') ? homePath : pathOf(cwd)

const segmentsOf = (typed: string): readonly string[] =>
  withoutTrailingSlash(typed)
    .replace(/^~/, '')
    .split('/')
    .filter((segment) => segment !== '' && segment !== '.')

const descend = (base: string, segment: string): string =>
  segment === '..' ? base.slice(0, Math.max(base.lastIndexOf('/'), 0)) : `${base}/${segment}`

const candidatesFor = (typed: string, cwd: Cwd): readonly string[] => {
  const path = segmentsOf(typed).reduce(descend, baseOf(typed, cwd))
  return [path, ...extensions.map((extension) => path + extension)]
}

export const resolve = (typed: string, cwd: Cwd, volume: Volume): Resolution => {
  const entry = candidatesFor(typed, cwd)
    .map((candidate) => volume.stat(candidate))
    .find((found) => found !== undefined)
  return entry === undefined ? { kind: 'notFound', target: typed } : { kind: 'found', entry }
}

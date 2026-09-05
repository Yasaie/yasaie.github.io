import { homePath, parentOf, parentOfHomePath, workPath } from '@/fs/path/path'

export type Permissions = 'drwxr-xr-x' | '-rw-r--r--' | '-r--------' | 'd---------'

export type Owner = {
  readonly user: string
  readonly group: string
}

export type Inode = {
  readonly permissions: Permissions
  readonly owner: Owner
  readonly year: string | null
  readonly locked: boolean
}

export type SyntheticEntry = {
  readonly name: string
  readonly path: string
}

export const directoryBytes = 4096

const payam: Owner = Object.freeze({ user: 'payam', group: 'yasaie' })
const root: Owner = Object.freeze({ user: 'root', group: 'root' })

const open = (permissions: Permissions, year: string | null): Inode =>
  Object.freeze({ permissions, owner: payam, year, locked: false })

const sealed = (permissions: Permissions, owner: Owner, year: string): Inode =>
  Object.freeze({ permissions, owner, year, locked: true })

const declared: ReadonlyMap<string, Inode> = new Map([
  [homePath, open('drwxr-xr-x', '2010')],
  [parentOfHomePath, sealed('d---------', root, '1993')],
  [workPath, open('drwxr-xr-x', '2024')],
  [`${homePath}/whoami.txt`, open('-rw-r--r--', '2010')],
  [`${homePath}/stack.txt`, open('-rw-r--r--', '2026')],
  [`${homePath}/contact.txt`, open('-rw-r--r--', '2026')],
  [`${homePath}/.secrets`, sealed('-r--------', payam, '2010')],
])

export const inodeOf = (path: string, isDirectory: boolean): Inode =>
  declared.get(path) ?? open(isDirectory ? 'drwxr-xr-x' : '-rw-r--r--', null)

export const syntheticEntriesFor = (path: string): readonly SyntheticEntry[] =>
  Object.freeze([
    Object.freeze({ name: '.', path }),
    Object.freeze({ name: '..', path: parentOf(path) }),
  ])

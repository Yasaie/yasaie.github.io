export type DiskEntry =
  | { readonly kind: 'file'; readonly path: string; readonly bytes: number }
  | { readonly kind: 'directory'; readonly path: string }

export type DiskSource = {
  readonly enumerate: () => Promise<readonly DiskEntry[]>
  readonly read: (path: string) => Promise<string>
}

export const diskIndexPath = '/.superblock.json'

export type Located = { readonly path: string }

export const byPath = (left: Located, right: Located): number =>
  left.path < right.path ? -1 : left.path > right.path ? 1 : 0

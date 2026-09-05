import { syntheticEntriesFor } from '@/fs/inode/inode'
import { pathOf, resolve, workPath } from '@/fs/path/path'
import type { Volume, VolumeEntry } from '@/fs/volume/volume'
import type { App, Cwd, Invocation, Output } from '@/kernel/contract/contract'
import { padLeft, padRight, widestLength } from '@/tty/align/align'
import type { SizeFormat } from '@/tty/bytes/bytes'
import { formatSize } from '@/tty/bytes/bytes'
import type { Line } from '@/tty/line/line'
import { responsive, row, segment, text } from '@/tty/line/line'
import type { Colour } from '@/tty/palette/palette'

type Listing =
  | { readonly kind: 'directory'; readonly path: string }
  | { readonly kind: 'file'; readonly entry: VolumeEntry }
  | { readonly kind: 'sealed'; readonly target: string }
  | { readonly kind: 'missing'; readonly target: string }

type Sized = {
  readonly entry: VolumeEntry
  readonly size: string
  readonly year: string
}

type Columns = {
  readonly size: number
  readonly user: number
  readonly group: number
  readonly year: number
}

const flagsOfAlias: Readonly<Record<string, string>> = Object.freeze({ ll: 'l', la: 'la' })

const homeListingOrder: readonly string[] = ['whoami.txt', 'work', 'stack.txt', 'contact.txt']

const isFlag = (argument: string): boolean => argument.startsWith('-')

const flagsOf = ({ name, args }: Invocation): string =>
  `${flagsOfAlias[name] ?? ''}${args.filter(isFlag).join('')}`

const targetOf = ({ args }: Invocation): string | undefined =>
  args.find((argument) => !isFlag(argument))

const listingOf = (target: string | undefined, cwd: Cwd, volume: Volume): Listing => {
  if (target === undefined) return { kind: 'directory', path: pathOf(cwd) }
  const resolution = resolve(target.toLowerCase(), cwd, volume)
  if (resolution.kind === 'notFound') return { kind: 'missing', target }
  if (!resolution.entry.directory) return { kind: 'file', entry: resolution.entry }
  if (resolution.entry.locked) return { kind: 'sealed', target }
  return { kind: 'directory', path: resolution.entry.path }
}

const rankOf = (entry: VolumeEntry): number => {
  const declared = homeListingOrder.indexOf(entry.name)
  return declared === -1 ? homeListingOrder.length : declared
}

const isHidden = (entry: VolumeEntry): boolean => entry.name.startsWith('.')

const renamed = (entry: VolumeEntry, name: string): VolumeEntry => Object.freeze({ ...entry, name })

const selfAndParent = (path: string, volume: Volume): readonly VolumeEntry[] =>
  syntheticEntriesFor(path).flatMap((synthetic) => {
    const entry = volume.stat(synthetic.path)
    return entry === undefined ? [] : [renamed(entry, synthetic.name)]
  })

const entriesIn = (path: string, all: boolean, volume: Volume): readonly VolumeEntry[] => {
  const children = volume.list(path)
  const visible = children
    .filter((entry) => !isHidden(entry))
    .toSorted((left, right) => rankOf(left) - rankOf(right))
  if (!all) return visible
  return [...selfAndParent(path, volume), ...children.filter(isHidden), ...visible]
}

const displayName = (entry: VolumeEntry): string =>
  entry.directory ? `${entry.name}/` : entry.name

const colourOf = (entry: VolumeEntry): Colour => {
  if (entry.directory) return 'accent'
  return entry.locked ? 'muted' : 'body'
}

const isChapter = (entry: VolumeEntry): boolean => entry.path.startsWith(`${workPath}/`)

const firstYearIn = (contents: string): string => /\b\d{4}\b/.exec(contents)?.[0] ?? ''

const yearOf = (entry: VolumeEntry, volume: Volume): string =>
  entry.year ?? (isChapter(entry) ? firstYearIn(volume.require(entry.path)) : '')

const sizedAs = (entry: VolumeEntry, format: SizeFormat, volume: Volume): Sized => ({
  entry,
  size: formatSize(entry.bytes, format),
  year: yearOf(entry, volume),
})

const columnsFor = (sized: readonly Sized[]): Columns => ({
  size: widestLength(sized.map((item) => item.size)),
  user: widestLength(sized.map((item) => item.entry.owner.user)),
  group: widestLength(sized.map((item) => item.entry.owner.group)),
  year: widestLength(sized.map((item) => item.year)),
})

const longRow = ({ entry, size, year }: Sized, columns: Columns): Line => {
  const owner = `${padRight(entry.owner.user, columns.user)} ${padRight(entry.owner.group, columns.group)}`
  const width = padLeft(size, columns.size)
  const colour = colourOf(entry)
  return responsive(
    row([
      segment(
        `${entry.permissions}  1 ${owner} ${width} ${padRight(year, columns.year)}  ${displayName(entry)}`,
        colour,
      ),
    ]),
    [row([segment(`${entry.permissions} ${width} ${displayName(entry)}`, colour)])],
  )
}

const longListing = (
  entries: readonly VolumeEntry[],
  format: SizeFormat,
  volume: Volume,
): readonly Line[] => {
  const sized = entries.map((entry) => sizedAs(entry, format, volume))
  const columns = columnsFor(sized)
  return [text(`total ${entries.length}`, 'muted'), ...sized.map((item) => longRow(item, columns))]
}

const shortListing = (entries: readonly VolumeEntry[]): readonly Line[] => [
  text(entries.map(displayName).join('  '), 'body'),
]

const printed = (entries: readonly VolumeEntry[], flags: string, volume: Volume): Output => ({
  lines: flags.includes('l')
    ? longListing(entries, flags.includes('h') ? 'human' : 'exact', volume)
    : shortListing(entries),
  effects: [],
})

const complaint = (message: string): Output => ({
  lines: [text(`ls: ${message}`, 'muted')],
  effects: [],
})

export const ls: App = {
  name: 'ls',
  aliases: ['dir', 'll', 'la'],
  summary: 'list directory contents',
  listed: null,
  counted: false,
  handles: [],
  run: (invocation, volume) => {
    const flags = flagsOf(invocation)
    const listing = listingOf(targetOf(invocation), invocation.cwd, volume)
    switch (listing.kind) {
      case 'missing':
        return complaint(`cannot access '${listing.target}': no such file or directory`)
      case 'sealed':
        return complaint(`cannot open directory '${listing.target}': permission denied`)
      case 'file':
        return printed([listing.entry], flags, volume)
      case 'directory':
        return printed(entriesIn(listing.path, flags.includes('a'), volume), flags, volume)
    }
  },
}

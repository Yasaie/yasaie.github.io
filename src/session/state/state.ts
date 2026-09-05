import { documentLines } from '@/fs/document/document'
import type { Cwd } from '@/fs/path/path'
import type { Volume } from '@/fs/volume/volume'
import { noHistoryIndex } from '@/session/history/history'
import { type KeyValueColours, type KeyValuePair, keyValueBlock } from '@/tty/align/align'
import { blank, type Line, responsive, row, segment, text, wordmark } from '@/tty/line/line'
import type { Colour } from '@/tty/palette/palette'

export type QueuedLine = {
  readonly line: Line
  readonly speedMs: number
}

export type Scheduled =
  | { readonly kind: 'reboot'; readonly delayMs: number }
  | { readonly kind: 'reward'; readonly delayMs: number }

export type TerminalState = {
  readonly typed: string
  readonly caret: number
  readonly lines: readonly Line[]
  readonly queue: readonly QueuedLine[]
  readonly history: readonly string[]
  readonly historyIndex: number
  readonly discovered: readonly string[]
  readonly cwd: Cwd
  readonly focused: boolean
  readonly scheduled: readonly Scheduled[]
}

export const scrollbackLimit = 400
const bootSpeedMs = 14
export const outputSpeedMs = 28
export const rewardDelayMs = 600

const issuePath = '/etc/issue'
const releasePath = '/etc/yasaie-release'

export const homeDirectory: Cwd = '~'

const nameColour: Colour = 'text'
const hintColour: Colour = 'muted'
const rewardColour: Colour = 'accent'

const bootColours: KeyValueColours = { key: 'muted', value: 'body' }

const hintWide = 'type  help  or press tab'
const hintNarrow = 'type  help'

const reward = 'all nine. you read the whole thing. that deserves a reply: payam@yasaie.com'

export const queuedLines = (lines: readonly Line[], speedMs: number): readonly QueuedLine[] =>
  Object.freeze(lines.map((line) => Object.freeze({ line, speedMs })))

const documentRows = (document: string | undefined): readonly string[] =>
  document === undefined ? [] : documentLines(document)

const unquoted = (value: string): string => value.replace(/^"(.*)"$/, '$1')

const pairOf = (declaration: string): KeyValuePair => {
  const separator = declaration.indexOf('=')
  return {
    key: declaration.slice(0, separator).toLowerCase(),
    value: unquoted(declaration.slice(separator + 1)),
  }
}

const brightenFirst = (pairs: readonly KeyValuePair[]): readonly KeyValuePair[] =>
  pairs.map((pair, position) => (position === 0 ? { ...pair, valueColour: nameColour } : pair))

const banner = (volume: Volume): readonly Line[] =>
  documentRows(volume.read(issuePath)).map(wordmark)

const bootedKey = 'since'
const uptimeKey = 'uptime'

const asUptime = (pair: KeyValuePair, thisYear: number): KeyValuePair =>
  pair.key === bootedKey
    ? { key: uptimeKey, value: `${thisYear - Number(pair.value)} years` }
    : pair

const identity = (volume: Volume, thisYear: number): readonly Line[] =>
  keyValueBlock(
    brightenFirst(
      documentRows(volume.read(releasePath))
        .map(pairOf)
        .map((pair) => asUptime(pair, thisYear)),
    ),
    bootColours,
  )

const hint = responsive(row([segment(hintWide, hintColour)]), [
  row([segment(hintNarrow, hintColour)]),
])

export const bootSequence = (volume: Volume, thisYear: number): readonly QueuedLine[] =>
  queuedLines(
    [...banner(volume), blank, ...identity(volume, thisYear), blank, hint, blank],
    bootSpeedMs,
  )

export const rewardSequence: readonly QueuedLine[] = queuedLines(
  [text(reward, rewardColour), blank],
  outputSpeedMs,
)

export const createSession = (volume: Volume, thisYear: number): TerminalState => ({
  typed: '',
  caret: 0,
  lines: [],
  queue: bootSequence(volume, thisYear),
  history: [],
  historyIndex: noHistoryIndex,
  discovered: [],
  cwd: homeDirectory,
  focused: false,
  scheduled: [],
})

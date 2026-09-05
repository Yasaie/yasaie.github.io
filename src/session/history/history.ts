export const historyLimit = 50

export const noHistoryIndex = -1

export type HistoryMove =
  | {
      readonly kind: 'moved'
      readonly index: number
      readonly entry: string
      readonly caret: number
    }
  | { readonly kind: 'unchanged' }

const movedTo = (entries: readonly string[], index: number): HistoryMove => {
  const entry = entries[index] ?? ''
  return { kind: 'moved', index, entry, caret: entry.length }
}

export const pushHistory = (entries: readonly string[], entry: string): readonly string[] =>
  [entry, ...entries].slice(0, historyLimit)

export const stepBack = (entries: readonly string[], index: number): HistoryMove => {
  const older = Math.min(index + 1, entries.length - 1)
  return older <= noHistoryIndex ? { kind: 'unchanged' } : movedTo(entries, older)
}

export const stepForward = (entries: readonly string[], index: number): HistoryMove =>
  movedTo(entries, Math.max(index - 1, noHistoryIndex))

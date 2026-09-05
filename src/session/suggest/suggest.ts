export type Suggestable = {
  readonly typed: string
  readonly history: readonly string[]
  readonly discovered: readonly string[]
}

export type Ghostable = Suggestable & { readonly caret: number }

export const suggestionOrder: readonly string[] = Object.freeze([
  'whoami',
  'work',
  'stack',
  'contact',
  'help',
  'clear',
])

const fallback = 'help'

const chapterlessWork = /^work\s+$/

const firstChapter = '1'

const firstUndiscovered = (discovered: readonly string[]): string =>
  suggestionOrder.find((command) => !discovered.includes(command)) ?? fallback

const extending = (candidates: readonly string[], prefix: string): string | undefined =>
  candidates.find((candidate) => candidate.startsWith(prefix) && candidate !== prefix)

export const suggest = ({ typed, history, discovered }: Suggestable): string => {
  if (typed === '') return firstUndiscovered(discovered)
  const prefix = typed.toLowerCase()
  if (chapterlessWork.test(prefix)) return `${typed}${firstChapter}`
  return extending(history, prefix) ?? extending(suggestionOrder, prefix) ?? ''
}

export const ghost = (input: Ghostable): string => {
  if (input.caret < input.typed.length) return ''
  const suggestion = suggest(input)
  return suggestion.toLowerCase().startsWith(input.typed.toLowerCase())
    ? suggestion.slice(input.typed.length)
    : ''
}

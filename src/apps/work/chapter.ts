import { documentBlocks } from '@/fs/document/document'

export type Chapter = {
  readonly index: number
  readonly path: string
  readonly years: string
  readonly company: string
  readonly role: string
  readonly place: string
  readonly bullets: readonly string[]
}

const heading = '# '
const bullet = '- '
const separator = ' · '

const startingWith = (prefix: string, lines: readonly string[]): readonly string[] =>
  lines.filter((line) => line.startsWith(prefix)).map((line) => line.slice(prefix.length))

export const parseChapter = (index: number, path: string, document: string): Chapter => {
  const [title = [], credits = [], body = []] = documentBlocks(document)
  const [years = '', ...rest] = (credits[0] ?? '').split(separator)
  const [company = ''] = startingWith(heading, title)
  return Object.freeze({
    index,
    path,
    years,
    company,
    role: rest.slice(0, -1).join(separator),
    place: rest.at(-1) ?? '',
    bullets: Object.freeze(startingWith(bullet, body)),
  })
}

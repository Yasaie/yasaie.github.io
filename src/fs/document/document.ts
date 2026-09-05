export type Block = readonly string[]

export type ColumnPair = {
  readonly key: string
  readonly value: string
}

const trailingNewline = /\n$/
const blankLine = /\n[ \t]*\n/
const gutter = /\s{2,}/

const body = (document: string): string => document.replace(trailingNewline, '')

export const documentLines = (document: string): readonly string[] =>
  Object.freeze(body(document).split('\n'))

export const documentBlocks = (document: string): readonly Block[] =>
  Object.freeze(
    body(document)
      .split(blankLine)
      .filter((block) => block.trim() !== '')
      .map((block) => Object.freeze(block.split('\n'))),
  )

const pairOf = (line: string): readonly ColumnPair[] => {
  const found = gutter.exec(line)
  if (found === null) return []
  return [
    Object.freeze({
      key: line.slice(0, found.index),
      value: line.slice(found.index + found[0].length),
    }),
  ]
}

export const columnPairs = (document: string): readonly ColumnPair[] =>
  Object.freeze(documentLines(document).flatMap(pairOf))

import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

export type SourceFile = {
  readonly path: string
  readonly text: string
}

const repoRoot = process.cwd()

const posix = (path: string): string => path.split(sep).join('/')

const byPath = (left: SourceFile, right: SourceFile): number =>
  left.path < right.path ? -1 : left.path > right.path ? 1 : 0

export const isTestPath = (path: string): boolean => /\.test\.tsx?$/.test(path)

export const foldersIn = (directory: string): readonly string[] =>
  readdirSync(join(repoRoot, directory), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted()

export const filesIn = (directory: string): readonly string[] =>
  readdirSync(join(repoRoot, directory), { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .toSorted()

export const sourceFilesIn = (directory: string): readonly SourceFile[] =>
  readdirSync(join(repoRoot, directory), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.tsx?$/.test(entry.name))
    .map((entry) => {
      const absolute = join(entry.parentPath, entry.name)
      return { path: posix(relative(repoRoot, absolute)), text: readFileSync(absolute, 'utf8') }
    })
    .toSorted(byPath)

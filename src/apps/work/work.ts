import { workPath } from '@/fs/path/path'
import type { Volume } from '@/fs/volume/volume'
import type { App, Invocation, Output } from '@/kernel/contract/contract'
import { padRight, widestLength } from '@/tty/align/align'
import { blank, type Line, responsive, row, runnable, segment, text } from '@/tty/line/line'
import type { Colour } from '@/tty/palette/palette'
import { type Chapter, parseChapter } from './chapter'

const chapterFiles: readonly string[] = [
  '1-goodhabitz.md',
  '2-owow-agency.md',
  '3-tas-hil-gostar.md',
  '4-tahlilgaran.md',
  '5-tabesh-rayan-energy.md',
  '6-freelance.md',
]

const invitation = 'work <n> for details. all of it shipped behind logins; nothing to click.'

const columnGutter = 2
const stackedCreditsIndent = '5ch'

const chaptersOf = (volume: Volume): readonly Chapter[] =>
  volume
    .list(workPath)
    .filter((entry) => !entry.directory)
    .map((entry, position) => parseChapter(position + 1, entry.path, volume.require(entry.path)))

const listing = (chapters: readonly Chapter[]): readonly Line[] => {
  const yearsWidth = widestLength(chapters.map((chapter) => chapter.years))
  const companyWidth = widestLength(chapters.map((chapter) => chapter.company)) + columnGutter
  const entryOf = (chapter: Chapter): Line => {
    const colour: Colour = chapter.index === 1 ? 'text' : 'body'
    const marker = `[${chapter.index}]  `
    return runnable(
      responsive(
        row([
          segment(
            `${marker}${padRight(chapter.years, yearsWidth)}  ${padRight(chapter.company, companyWidth)}${chapter.role}`,
            colour,
          ),
        ]),
        [
          row([segment(`${marker}${chapter.company}`, colour)]),
          row([segment(`${chapter.years} · ${chapter.role}`, 'muted')], stackedCreditsIndent),
        ],
      ),
      `work ${chapter.index}`,
    )
  }
  return [...chapters.map(entryOf), blank, text(invitation, 'muted')]
}

const detail = (chapter: Chapter): readonly Line[] => [
  text(`${chapter.years}  ${chapter.company}`, 'text'),
  text(`${chapter.role} · ${chapter.place}`, 'muted'),
  blank,
  ...chapter.bullets.map((point) => text(`- ${point}`, 'body')),
]

const chapterFor = (requested: string, chapters: readonly Chapter[]): Chapter | undefined => {
  const numbered = Number.parseInt(requested, 10)
  return chapters.find((chapter) => chapter.index === numbered || chapter.path === requested)
}

const render = (invocation: Invocation, volume: Volume): Output => {
  const chapters = chaptersOf(volume)
  const requested = invocation.args[0]
  if (requested === undefined) return { lines: listing(chapters), effects: [] }
  const chosen = chapterFor(requested, chapters)
  return chosen === undefined
    ? { lines: [text(`work: no chapter ${requested}`, 'muted')], effects: [] }
    : { lines: detail(chosen), effects: [] }
}

export const work: App = {
  name: 'work',
  aliases: ['cv', 'history'],
  summary: 'six chapters, 2010 to now · work <n> for one',
  listed: 2,
  counted: true,
  handles: chapterFiles.map((file) => `${workPath}/${file}`),
  run: render,
}

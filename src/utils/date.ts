import { ToWords } from 'to-words'

import type { Chapter } from '@/types'

import { chapters } from '@/data/chapters'

const toWords = new ToWords({ localeCode: 'en-US' })

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

export function getChapter(index: number): Chapter {
  const chapter = chapters.at(index)
  if (!chapter) throw new Error(`No chapter at index ${index}`)
  return chapter
}

export function getCurrentChapter(): Chapter {
  return getChapter(-1)
}

export function getYearsOfExperience(): number {
  return getCurrentYear() - getChapter(0).startYear
}

export function getYearsOfExperienceWord(): string {
  return toWords.convert(getYearsOfExperience())
}

export function yrs(startYear: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'unit',
    unit: 'year',
    unitDisplay: 'short',
  }).format(getCurrentYear() - startYear)
}
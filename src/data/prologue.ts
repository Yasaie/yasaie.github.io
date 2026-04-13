import { getYearsOfExperienceWord } from '@/utils/date'

export interface PrologueStatement {
  eyebrow: string
  heading: string
  tagline: string
}

export const prologueStatements: PrologueStatement[] = [
  {
    eyebrow: 'Doing what I love for',
    heading: `${getYearsOfExperienceWord()} years`,
    tagline: 'every single day',
  },
  {
    eyebrow: 'Every project delivered is',
    heading: 'Built to Last',
    tagline: 'not just for today',
  },
  {
    eyebrow: 'Dream as big as you want',
    heading: 'Nothing Is Impossible',
    tagline: 'no idea is too big to build',
  },
]

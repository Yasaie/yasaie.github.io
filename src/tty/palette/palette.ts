export type Colour = 'accent' | 'text' | 'body' | 'muted' | 'faint'

export const colourClass = Object.freeze({
  accent: 'text-terminal-accent',
  text: 'text-terminal-text',
  body: 'text-terminal-body',
  muted: 'text-terminal-muted',
  faint: 'text-terminal-faint',
}) satisfies Readonly<Record<Colour, string>>

import type { Cwd, Invocation } from '@/kernel/app/app'

export type ParsedLine =
  | { readonly kind: 'blank' }
  | { readonly kind: 'invocation'; readonly invocation: Invocation }

const blank: ParsedLine = Object.freeze({ kind: 'blank' })

export const parse = (raw: string, cwd: Cwd): ParsedLine => {
  const input = raw.trim()
  if (input === '') return blank
  const [name = '', ...args] = input.split(/\s+/)
  return {
    kind: 'invocation',
    invocation: { name: name.toLowerCase(), args: Object.freeze(args), raw: input, cwd },
  }
}

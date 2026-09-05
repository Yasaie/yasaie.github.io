import type { Cwd, Invocation } from '@/kernel/app/app'
import { parse } from '@/kernel/parse/parse'

export const invocation = (raw: string, cwd: Cwd = '~'): Invocation => {
  const parsed = parse(raw, cwd)
  if (parsed.kind === 'blank') throw new Error(`not an invocation: "${raw}"`)
  return parsed.invocation
}

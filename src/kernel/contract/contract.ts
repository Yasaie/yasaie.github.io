import type { Cwd } from '@/fs/path/path'
import type { Volume } from '@/fs/volume/volume'
import type { Effect } from '@/kernel/effects/effects'
import type { Line } from '@/tty/line/line'

export type { Cwd, Effect }

export type Invocation = {
  readonly name: string
  readonly args: readonly string[]
  readonly raw: string
  readonly cwd: Cwd
}

export type Output = {
  readonly lines: readonly Line[]
  readonly effects: readonly Effect[]
  readonly speedMs?: number
}

export type App = {
  readonly name: string
  readonly aliases: readonly string[]
  readonly summary: string
  readonly listed: number | null
  readonly counted: boolean
  readonly handles: readonly string[]
  readonly run: (invocation: Invocation, volume: Volume) => Output
}

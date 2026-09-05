import type { ReactElement } from 'react'
import { cn } from '@/ui/cn/cn'

const caret =
  'inline-block h-[1.15em] w-[0.6em] -mr-[0.6em] animate-caret bg-terminal-accent align-text-bottom motion-reduce:animate-none'

export type PromptGhostProps = {
  readonly beforeCaret: string
  readonly ghost: string
  readonly focused: boolean
}

export const PromptGhost = ({ beforeCaret, ghost, focused }: PromptGhostProps): ReactElement => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre text-terminal-faint"
  >
    <span className="invisible">{beforeCaret}</span>
    <span data-caret="" className={cn(caret, focused ? 'opacity-100' : 'opacity-35')} />
    {ghost}
  </div>
)

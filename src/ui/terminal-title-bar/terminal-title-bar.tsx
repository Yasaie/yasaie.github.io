import type { ReactElement } from 'react'
import { useClock } from '@/hooks/use-clock/use-clock'

const host = 'payam@yasaie.com — zsh'
const zone = 'CET'

export const TerminalTitleBar = (): ReactElement => {
  const time = useClock()

  return (
    <div className="relative z-[2] flex justify-between px-[clamp(20px,4vw,40px)] pt-[24px] text-[12px] text-terminal-faint">
      <span>{host}</span>
      <span>{`${time} ${zone}`}</span>
    </div>
  )
}

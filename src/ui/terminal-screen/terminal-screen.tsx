import type { ReactElement } from 'react'
import type { Volume } from '@/fs/volume/volume'
import { useClickToFocus } from '@/hooks/use-click-to-focus/use-click-to-focus'
import { useTerminal } from '@/hooks/use-terminal/use-terminal'
import { useTypeToFocus } from '@/hooks/use-type-to-focus/use-type-to-focus'
import { TerminalBackdrop } from '@/ui/terminal-backdrop/terminal-backdrop'
import { TerminalPrompt } from '@/ui/terminal-prompt/terminal-prompt'
import { TerminalScrollback } from '@/ui/terminal-scrollback/terminal-scrollback'
import { TerminalTitleBar } from '@/ui/terminal-title-bar/terminal-title-bar'

const surface =
  'fixed inset-0 flex flex-col justify-center overflow-hidden bg-terminal-bg font-mono text-screen leading-relaxed text-terminal-text'

const frame =
  'relative z-10 mx-auto flex h-full max-h-[900px] w-full max-w-measure min-h-0 flex-1 flex-col px-gutter'

export type TerminalScreenProps = {
  readonly volume: Volume
}

export const TerminalScreen = ({ volume }: TerminalScreenProps): ReactElement => {
  const terminal = useTerminal(volume)
  const input = useTypeToFocus<HTMLInputElement>()
  useClickToFocus(input)

  return (
    <div className={surface}>
      <TerminalBackdrop />
      <div className={frame}>
        <TerminalTitleBar />
        <TerminalScrollback lines={terminal.state.lines} />
        <TerminalPrompt terminal={terminal} inputRef={input} />
      </div>
    </div>
  )
}

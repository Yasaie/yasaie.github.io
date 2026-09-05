import type { ReactElement } from 'react'
import { useVolume } from '@/hooks/use-volume/use-volume'
import { TerminalScreen } from '@/ui/terminal-screen/terminal-screen'

const mountFailure = 'mount: /'

export const App = (): ReactElement | null => {
  const disk = useVolume()

  switch (disk.status) {
    case 'mounting':
      return null
    case 'ready':
      return <TerminalScreen volume={disk.volume} />
    case 'failed':
      return (
        <p className="fixed inset-0 bg-terminal-bg px-[clamp(20px,4vw,40px)] pt-[24px] font-mono text-[length:clamp(13px,0.55vw_+_10px,17px)] leading-[1.6] text-terminal-muted">
          {`${mountFailure}: ${disk.failure}`}
        </p>
      )
  }
}

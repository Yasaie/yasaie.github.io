import type { ReactElement } from 'react'
import { useParallax } from '@/hooks/use-parallax/use-parallax'
import { DotField } from '@/ui/dot-field/dot-field'

const nearDepth = 10
const middleDepth = 24
const farDepth = 48

const layer =
  'absolute -inset-[10%] will-change-transform [mask-image:radial-gradient(ellipse_at_50%_50%,black_30%,transparent_75%)] [mask-repeat:no-repeat] [mask-size:100%_100%]'

const near =
  '[background-image:radial-gradient(color-mix(in_srgb,var(--color-terminal-text)_20%,transparent)_1px,transparent_1px)] [background-size:28px_28px]'
const middle =
  '[background-image:radial-gradient(color-mix(in_srgb,var(--color-terminal-text)_12%,transparent)_1px,transparent_1px)] [background-size:64px_64px]'
const far =
  '[background-image:radial-gradient(color-mix(in_srgb,var(--color-terminal-text)_9%,transparent)_1.5px,transparent_1.5px)] [background-size:180px_180px]'

export const TerminalBackdrop = (): ReactElement => {
  const nearRef = useParallax<HTMLDivElement>(nearDepth)
  const middleRef = useParallax<HTMLDivElement>(middleDepth)
  const farRef = useParallax<HTMLDivElement>(farDepth)

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div ref={nearRef} data-dots="" className={`${layer} ${near}`} />
      <div ref={middleRef} className={`${layer} ${middle}`} />
      <div ref={farRef} className={`${layer} ${far}`} />
      <DotField />
    </div>
  )
}

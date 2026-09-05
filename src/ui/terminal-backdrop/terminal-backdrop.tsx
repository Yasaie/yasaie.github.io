import type { ReactElement } from 'react'
import { useParallax } from '@/hooks/use-parallax/use-parallax'

const nearDepth = 10
const middleDepth = 24
const farDepth = 48

const layer = 'absolute inset-[-10%] will-change-transform'

const nearDots =
  '[background-image:radial-gradient(color-mix(in_srgb,var(--color-terminal-text)_14%,transparent)_1px,transparent_1px)] [background-size:28px_28px]'
const middleDots =
  '[background-image:radial-gradient(color-mix(in_srgb,var(--color-terminal-text)_8%,transparent)_1px,transparent_1px)] [background-size:64px_64px]'
const farDots =
  '[background-image:radial-gradient(color-mix(in_srgb,var(--color-terminal-accent)_30%,transparent)_1.5px,transparent_1.5px)] [background-size:180px_180px]'

const vignette =
  'absolute inset-0 [background:radial-gradient(ellipse_at_50%_50%,color-mix(in_srgb,var(--color-terminal-bg)_55%,transparent)_20%,var(--color-terminal-bg)_90%)]'

export const TerminalBackdrop = (): ReactElement => {
  const near = useParallax<HTMLDivElement>(nearDepth)
  const middle = useParallax<HTMLDivElement>(middleDepth)
  const far = useParallax<HTMLDivElement>(farDepth)

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div ref={near} className={`${layer} ${nearDots}`} />
      <div ref={middle} className={`${layer} ${middleDots}`} />
      <div ref={far} className={`${layer} ${farDots}`} />
      <div className={vignette} />
    </div>
  )
}

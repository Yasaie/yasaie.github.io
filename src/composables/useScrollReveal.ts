import { gsap } from 'gsap'

export interface ScrollRevealOptions {
  delay?: number
  duration?: number
  ease?: string
  start?: string
  y?: number
}

export function scrollReveal(
  el: Element | null | undefined,
  options: ScrollRevealOptions = {},
): void {
  if (!el) return
  const {
    y = 28,
    duration = 0.85,
    delay = 0,
    ease = 'power3.out',
    start = 'top 82%',
  } = options

  gsap.fromTo(
    el,
    { opacity: 0, y },
    {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease,
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
      },
    },
  )
}
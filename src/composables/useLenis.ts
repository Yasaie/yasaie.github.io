import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { onMounted, onUnmounted } from 'vue'

let lenis: Lenis | null = null

export function getLenis(): Lenis | null {
  return lenis
}

export function useLenis(): void {
  onMounted(() => {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    })

    // Keep GSAP's ScrollTrigger in sync with Lenis scroll position
    lenis.on('scroll', ScrollTrigger.update)

    // Drive Lenis via GSAP's ticker so timing is unified
    gsap.ticker.add((time: number) => {
      lenis?.raf(time * 1000)
    })

    // Disable GSAP's default lag smoothing so Lenis controls the feel
    gsap.ticker.lagSmoothing(0)
  })

  onUnmounted(() => {
    gsap.ticker.remove((time: number) => {
      lenis?.raf(time * 1000)
    })
    lenis?.destroy()
    lenis = null
  })
}

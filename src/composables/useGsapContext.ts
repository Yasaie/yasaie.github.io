import { gsap } from 'gsap'
import { onMounted, onUnmounted } from 'vue'

export function useGsapContext(
  factory: () => void,
  scope?: () => Element | null | undefined,
): void {
  let ctx: gsap.Context | null = null
  onMounted(() => {
    ctx = gsap.context(factory, scope?.() ?? undefined)
  })
  onUnmounted(() => {
    ctx?.revert()
  })
}
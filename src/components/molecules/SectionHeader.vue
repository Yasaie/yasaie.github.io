<script setup lang="ts">
import { gsap } from 'gsap'
import { ref } from 'vue'

import RuleDivider from '@/components/atoms/RuleDivider.vue'
import { useGsapContext } from '@/composables/useGsapContext'

defineProps<{
    eyebrow: string
    title: string
}>()

const headerRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
    if (!headerRef.value) return
    gsap.fromTo(
        headerRef.value,
        { opacity: 0, y: 32 },
        {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: headerRef.value,
                start: 'top 82%',
                toggleActions: 'play none none none',
            },
        },
    )
}, () => headerRef.value)
</script>

<template>
  <div
    ref="headerRef"
    class="relative z-10 text-center mb-16 md:mb-36 px-6 opacity-0"
  >
    <p class="font-ui text-muted uppercase text-xs tracking-super mb-4 md:mb-6">
      {{ eyebrow }}
    </p>
    <h2 class="font-display font-bold text-content m-0 text-[clamp(1.5rem,6vw,3rem)] md:text-[clamp(1.8rem,4.5vw,3rem)] tracking-wide">
      {{ title }}
    </h2>
    <RuleDivider
      line="fixed"
      color="subtle"
      gap="md"
      class="justify-center mt-6 md:mt-8"
    />
  </div>
</template>

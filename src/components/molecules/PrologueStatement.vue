<script setup lang="ts">
import { gsap } from 'gsap'
import { ref } from 'vue'

import { useGsapContext } from '@/composables/useGsapContext'

defineProps<{
    eyebrow: string
    heading: string
    tagline: string
}>()

const blockRef  = ref<HTMLElement | null>(null)
const eyebrowRef = ref<HTMLElement | null>(null)
const headingRef = ref<HTMLElement | null>(null)
const taglineRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
    if (!blockRef.value || !eyebrowRef.value || !headingRef.value || !taglineRef.value) return

    gsap.timeline({
        scrollTrigger: { trigger: blockRef.value, start: 'top 78%', toggleActions: 'play none none none' },
        defaults: { ease: 'power3.out' },
    })
        .fromTo(eyebrowRef.value, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.65 })
        .fromTo(headingRef.value, { opacity: 0, y: 42, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.85 }, '-=0.3')
        .fromTo(taglineRef.value, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.65 }, '-=0.45')
}, () => blockRef.value)
</script>

<template>
  <div
    ref="blockRef"
    class="flex flex-col items-center gap-5 md:gap-7"
  >
    <p
      ref="eyebrowRef"
      class="font-ui text-muted uppercase text-xs md:text-sm/prose tracking-super m-0 opacity-0"
    >
      {{ eyebrow }}
    </p>
    <h2
      ref="headingRef"
      class="m-0 leading-none opacity-0"
    >
      <span
        class="inline-block uppercase font-display font-bold text-[clamp(2rem,9vw,5.5rem)] md:text-[clamp(2.8rem,7.5vw,5.5rem)] tracking-wider bg-clip-text text-transparent drop-shadow-[0_0_40px_rgb(168_85_247/0.35)]"
        style="background-image: linear-gradient(135deg, #ffffff 0%, #c4b5fd 25%, #a78bfa 50%, #22d3ee 75%, #e0f2fe 100%);"
      >
        {{ heading }}
      </span>
    </h2>
    <p
      ref="taglineRef"
      class="font-ui text-muted uppercase text-xs md:text-sm/prose tracking-super m-0 opacity-0"
    >
      {{ tagline }}
    </p>
  </div>
</template>

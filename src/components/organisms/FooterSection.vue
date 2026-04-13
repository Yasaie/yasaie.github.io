<script setup lang="ts">
import { gsap } from 'gsap'
import { ref } from 'vue'

import EyebrowText from '@/components/atoms/EyebrowText.vue'
import GradientHeading from '@/components/atoms/GradientHeading.vue'
import NavLink from '@/components/atoms/NavLink.vue'
import RadialGlow from '@/components/atoms/RadialGlow.vue'
import RuleDivider from '@/components/atoms/RuleDivider.vue'
import VerticalDivider from '@/components/atoms/VerticalDivider.vue'
import { useGsapContext } from '@/composables/useGsapContext'
import { getCurrentChapter,getCurrentYear, getYearsOfExperience } from '@/utils/date'

const currentLocation = getCurrentChapter().location
const yearsOfExperience = getYearsOfExperience()
const currentYear = getCurrentYear()

const footerRef  = ref<HTMLElement | null>(null)
const eyebrowRef = ref<HTMLElement | null>(null)
const headlineRef = ref<HTMLElement | null>(null)
const rulerRef  = ref<HTMLElement | null>(null)
const taglineRef = ref<HTMLElement | null>(null)
const linksRef  = ref<HTMLElement | null>(null)
const metaRef   = ref<HTMLElement | null>(null)

useGsapContext(() => {
    const els = [
        eyebrowRef.value,
        headlineRef.value,
        rulerRef.value,
        taglineRef.value,
        linksRef.value,
        metaRef.value,
    ]

    els.forEach((el, i) => {
        if (!el) return
        gsap.fromTo(
            el,
            { opacity: 0, y: i < 3 ? 36 : 20 },
            {
                opacity: 1,
                y: 0,
                duration: 0.85,
                delay: i * 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: footerRef.value,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
            },
        )
    })
}, () => footerRef.value)
</script>


<template>
  <footer
    ref="footerRef"
    class="relative w-full overflow-hidden bg-bg px-6 md:px-[clamp(1.5rem,6vw,7rem)] pt-[clamp(5rem,14vw,14rem)] pb-[clamp(4rem,10vw,10rem)]"
  >
    <div
      class="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-purple-500/40 to-transparent"
      aria-hidden="true"
    />

    <RadialGlow
      position="top"
      intensity="medium"
    />

    <div class="relative z-10 flex flex-col items-center text-center">
      <div
        ref="eyebrowRef"
        class="mb-10 md:mb-16 opacity-0"
      >
        <EyebrowText>Let's Connect</EyebrowText>
      </div>

      <div
        ref="headlineRef"
        class="mb-10 md:mb-16 opacity-0"
      >
        <GradientHeading
          tag="h2"
          size="lg"
          class="uppercase max-w-3xl"
        >
          Let's build the next chapter together
        </GradientHeading>
      </div>

      <div
        ref="rulerRef"
        class="w-full max-w-2xs md:max-w-xs mb-12 md:mb-20 opacity-0"
      >
        <RuleDivider gap="lg" />
      </div>

      <p
        ref="taglineRef"
        class="font-body text-muted mb-12 md:mb-20 max-w-sm text-sm/prose opacity-0"
      >
        Senior engineer with {{ yearsOfExperience }}+ years of shipping products
        trusted by millions. Currently based in {{ currentLocation }} and always up for a good challenge.
      </p>

      <div
        ref="linksRef"
        class="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-12 md:mb-16 opacity-0"
      >
        <NavLink
          href="https://www.linkedin.com/in/yasaie"
          :external="true"
        >
          LinkedIn
        </NavLink>

        <VerticalDivider class="hidden md:block" />

        <NavLink
          href="https://github.com/yasaie"
          :external="true"
        >
          GitHub
        </NavLink>

        <VerticalDivider class="hidden md:block" />

        <NavLink href="mailto:payam@yasaie.com">
          Email
        </NavLink>
      </div>

      <div
        ref="metaRef"
        class="flex flex-col items-center gap-3 w-full max-w-sm pt-10 md:pt-14 border-t border-white/5 opacity-0"
      >
        <p class="font-ui text-dim text-xs tracking-widest mb-2">
          Made with care by Payam Yasaie · {{ currentYear }}
        </p>
      </div>
    </div>
  </footer>
</template>

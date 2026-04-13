<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'

import { gsap } from 'gsap'
import { useTemplateRef } from 'vue'

import EyebrowText from '@/components/atoms/EyebrowText.vue'
import GradientHeading from '@/components/atoms/GradientHeading.vue'
import ImageColumn from '@/components/atoms/ImageColumn.vue'
import RuleDivider from '@/components/atoms/RuleDivider.vue'
import ScrollIndicator from '@/components/atoms/ScrollIndicator.vue'
import { useGsapContext } from '@/composables/useGsapContext'
import { getYearsOfExperienceWord } from '@/utils/date'

const sectionRef = useTemplateRef<HTMLElement>('sectionRef')
const photoColRef = useTemplateRef<HTMLElement>('photoColRef')
const gradientHeadingRef = useTemplateRef<ComponentPublicInstance>('gradientHeadingRef')
const eyebrowRef = useTemplateRef<HTMLElement>('eyebrowRef')
const rulerRef = useTemplateRef<HTMLElement>('rulerRef')
const roleRef = useTemplateRef<HTMLElement>('roleRef')
const taglineRef = useTemplateRef<HTMLElement>('taglineRef')
const scrollIndicatorRef = useTemplateRef<HTMLElement>('scrollIndicatorRef')

useGsapContext(() => {
    gsap.fromTo(
        photoColRef.value,
        { opacity: 0, scale: 1.05 },
        { opacity: 1, scale: 1, duration: 1.8, ease: 'power3.out' }
    )

    const tl = gsap.timeline({ delay: 0.35, defaults: { ease: 'power3.out' } })

    tl.to(eyebrowRef.value, { opacity: 1, y: 0, duration: 0.65 }, 0)

    tl.fromTo(
        gradientHeadingRef.value?.$el ?? [],
        { y: 55, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0 },
        0.5
    )

    tl.fromTo(
        rulerRef.value,
        { opacity: 0, scaleX: 0.65 },
        { opacity: 1, scaleX: 1, duration: 0.65, transformOrigin: 'center center' },
        0.92
    )

    tl.to(roleRef.value, { opacity: 1, y: 0, duration: 0.55 }, 1.05)
    tl.to(taglineRef.value, { opacity: 1, y: 0, duration: 0.65 }, 1.18)
    tl.to(scrollIndicatorRef.value, { opacity: 1, duration: 0.55 }, 1.42)

    if (photoColRef.value && sectionRef.value) {
        gsap.to(photoColRef.value, {
            yPercent: 16,
            ease: 'none',
            scrollTrigger: {
                trigger: sectionRef.value,
                start: 'top top',
                end: 'bottom top',
                scrub: true,
            },
        })
    }
}, () => sectionRef.value)
</script>

<template>
  <section
    ref="sectionRef"
    class="relative w-full h-dvh min-h-150 overflow-hidden"
    aria-label="Hero"
  >
    <ImageColumn
      ref="photoColRef"
      src="/img/profile.jpg"
      alt="Payam Yasaie"
      class="w-full md:w-5/9"
    />

    <div class="absolute inset-0 md:inset-y-0 md:right-0 md:left-auto flex flex-col justify-center items-center md:items-start md:w-3/5 w-full px-6 md:px-[clamp(3.5rem,7vw,9rem)] py-[clamp(5rem,8vw,9rem)] md:pl-[clamp(1.5rem,3vw,3rem)]">
      <div class="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
        <div
          ref="eyebrowRef"
          class="mb-8 md:mb-10 opacity-0 translate-y-3.5"
        >
          <EyebrowText>A Senior Engineer's Story</EyebrowText>
        </div>

        <GradientHeading
          ref="gradientHeadingRef"
          class="opacity-0"
        >
          <span class="block">PAYAM</span>
          <span class="block">YASAIE</span>
        </GradientHeading>

        <div
          ref="rulerRef"
          class="w-full max-w-2xs md:max-w-xs my-8 md:my-12 opacity-0"
        >
          <RuleDivider
            color="strong"
            gap="md"
          />
        </div>

        <div
          ref="roleRef"
          class="opacity-0 translate-y-2.5"
        >
          <p class="font-ui text-muted uppercase m-0 text-xs tracking-super">
            Senior Software Engineer
          </p>
        </div>

        <div
          ref="taglineRef"
          class="mt-8 md:mt-10 max-w-80 md:max-w-104 opacity-0 translate-y-3"
        >
          <p class="font-body italic text-content/70 m-0 text-sm/prose">
            "{{ getYearsOfExperienceWord() }} years of craft — shipping products
            trusted by millions across Europe."
          </p>
        </div>
      </div>
    </div>

    <div
      ref="scrollIndicatorRef"
      class="absolute bottom-10 md:bottom-16 left-1/2 -translate-x-1/2 opacity-0"
    >
      <ScrollIndicator />
    </div>

    <div
      class="absolute right-0 top-1/5 w-1/2 h-2/3 pointer-events-none blur-[50px]"
      style="background: radial-gradient(ellipse at 65% 45%, rgb(139 92 246 / 8%) 0%, transparent 68%);"
      aria-hidden="true"
    />
  </section>
</template>

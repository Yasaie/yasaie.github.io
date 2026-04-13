<script setup lang="ts">
import { gsap } from 'gsap'
import { ref } from 'vue'

import type { Chapter } from '@/types'

import TagChip from '@/components/atoms/TagChip.vue'
import { useGsapContext } from '@/composables/useGsapContext'
import { toRomanNumeral } from '@/utils/numeral'

defineProps<{
    chapter: Chapter
    index: number
}>()

const rowRef     = ref<HTMLElement | null>(null)
const identityColRef = ref<HTMLElement | null>(null)
const contentColRef = ref<HTMLElement | null>(null)

useGsapContext(() => {
    const el     = rowRef.value
    const identityCol = identityColRef.value
    const contentCol = contentColRef.value
    if (!el) return

    const isEven = (el.dataset.index ? Number(el.dataset.index) : 0) % 2 === 0

    gsap.fromTo(
        el,
        { opacity: 0 },
        {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none',
            },
        },
    )

    if (identityCol) {
        gsap.fromTo(
            identityCol,
            { x: isEven ? -50 : 50, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
            },
        )
    }

    if (contentCol) {
        gsap.fromTo(
            contentCol,
            { x: isEven ? 40 : -40, opacity: 0 },
            {
                x: 0,
                opacity: 1,
                duration: 0.85,
                delay: 0.12,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 80%',
                    toggleActions: 'play none none none',
                },
            },
        )
    }
}, () => rowRef.value)
</script>

<template>
  <div
    ref="rowRef"
    class="chapter-row-hover relative w-full opacity-0"
    :data-index="index"
    :style="{ '--chapter-color': chapter.color }"
  >
    <div
      class="w-full h-px opacity-50"
      :style="{ background: `linear-gradient(to right, transparent 0%, ${chapter.color} 30%, ${chapter.color} 70%, transparent 100%)` }"
    />

    <div
      class="relative flex flex-col md:flex-row items-start w-full container mx-auto py-16 md:py-44 px-6 md:px-0"
      :class="index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'"
    >
      <div
        class="absolute pointer-events-none select-none font-display font-bold leading-none top-[-0.35em] opacity-[0.045] text-[45vw] md:text-[28vw] right-[-2vw]"
        :class="index % 2 === 0 ? 'right-[-2vw]' : 'md:left-[-2vw]'"
        :style="{ color: chapter.color }"
        aria-hidden="true"
      >
        {{ toRomanNumeral(chapter.id) }}
      </div>

      <div
        ref="identityColRef"
        class="relative flex flex-col justify-start w-full md:shrink-0 md:w-5/12 mb-8 md:mb-0"
        :class="index % 2 === 0 ? 'md:pr-[clamp(3.5rem,6vw,8rem)]' : 'md:pl-[clamp(3rem,5vw,7rem)]'"
      >
        <div
          class="font-display font-bold mb-5 md:mb-8 leading-none text-[clamp(3rem,12vw,5.5rem)] md:text-[clamp(4rem,7vw,6rem)] opacity-60"
          :style="{ color: chapter.color }"
          aria-hidden="true"
        >
          {{ String(chapter.id).padStart(2, '0') }}
        </div>

        <div class="flex items-center gap-3 mb-5 md:mb-8">
          <div
            class="h-px w-8 opacity-50"
            :style="{ background: chapter.color }"
          />
          <span class="font-ui text-muted uppercase text-xs tracking-super">
            {{ chapter.startYear }} - {{ chapter.endYear ?? 'Present' }}
          </span>
        </div>

        <p
          class="font-ui uppercase text-sm tracking-super mb-3 md:mb-5 opacity-85"
          :style="{ color: chapter.color }"
        >
          {{ chapter.company }}
        </p>

        <h3 class="font-display text-content font-semibold m-0 text-[clamp(1.4rem,5.5vw,1.8rem)] md:text-[clamp(1.6rem,3vw,2.5rem)] leading-snug">
          {{ chapter.title }}
        </h3>

        <p class="font-ui text-muted mt-3 md:mt-4 m-0 text-xs/relaxed tracking-widest">
          {{ chapter.subtitle }}
        </p>

        <div
          class="hidden md:block absolute inset-y-0 w-px opacity-25"
          :class="index % 2 === 0 ? 'right-[clamp(1rem,2vw,2.5rem)]' : 'left-[clamp(1rem,2vw,2.5rem)]'"
          :style="{ background: `linear-gradient(to bottom, transparent, ${chapter.color}, transparent)` }"
          aria-hidden="true"
        />
      </div>

      <div
        ref="contentColRef"
        class="flex flex-col justify-start flex-1 min-w-0 w-full"
      >
        <div
          class="md:hidden w-full h-px mb-8 opacity-20"
          :style="{ background: `linear-gradient(to right, ${chapter.color}, transparent)` }"
        />

        <p class="font-body text-muted/85 m-0 mb-8 md:mb-14 text-base/[1.9]">
          {{ chapter.content }}
        </p>

        <div class="flex flex-wrap gap-2 md:gap-3 mt-2">
          <TagChip
            v-for="tag in chapter.tags"
            :key="tag"
            :color="chapter.color"
          >
            {{ tag }}
          </TagChip>
        </div>
      </div>
    </div>

    <div
      class="w-full h-px opacity-10"
      :style="{ background: chapter.color }"
    />

    <div
      class="absolute inset-0 pointer-events-none -z-10"
      :style="{ background: `${chapter.color}08` }"
    />
  </div>
</template>

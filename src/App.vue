<script setup lang="ts">
import { ToWords } from 'to-words'

import RuleDivider from '@/components/atoms/RuleDivider.vue'
import ScrollProgress from '@/components/atoms/ScrollProgress.vue'
import ChapterRow from '@/components/molecules/ChapterRow.vue'
import PrologueStatement from '@/components/molecules/PrologueStatement.vue'
import SectionHeader from '@/components/molecules/SectionHeader.vue'
import SectionShell from '@/components/molecules/SectionShell.vue'
import FooterSection from '@/components/organisms/FooterSection.vue'
import HeroSection from '@/components/organisms/HeroSection.vue'
import { useLenis } from '@/composables/useLenis'
import { chapters } from '@/data/chapters'
import { prologueStatements } from '@/data/prologue'

const toWords = new ToWords({ localeCode: 'en-US' })
useLenis()

const chapterCountLabel = (() => {
    const word = toWords.convert(chapters.length)
    return `${word.charAt(0).toUpperCase() + word.slice(1)} Chapters`
})()
</script>

<template>
  <div class="relative overflow-x-hidden">
    <ScrollProgress />

    <HeroSection />

    <SectionShell
      aria-label="Introduction"
      glow
      glow-position="center"
      glow-intensity="subtle"
      class="flex items-center justify-center min-h-dvh py-[clamp(3rem,8vw,9rem)]"
    >
      <div class="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-3xl">
        <template
          v-for="(statement, i) in prologueStatements"
          :key="statement.heading"
        >
          <PrologueStatement
            :eyebrow="statement.eyebrow"
            :heading="statement.heading"
            :tagline="statement.tagline"
            :class="i < prologueStatements.length - 1 ? 'mb-14 md:mb-28' : ''"
          />

          <div
            v-if="i < prologueStatements.length - 1"
            class="w-full max-w-xs mx-auto mb-14 md:mb-28"
          >
            <RuleDivider gap="lg" />
          </div>
        </template>
      </div>
    </SectionShell>

    <SectionShell
      aria-label="Career Timeline"
      top-accent
      allow-overflow
      class="pt-20 md:pt-36 pb-0"
    >
      <SectionHeader
        :eyebrow="chapterCountLabel"
        title="THE JOURNEY"
      />

      <div class="relative z-10">
        <ChapterRow
          v-for="(chapter, index) in chapters"
          :key="chapter.id"
          :chapter="chapter"
          :index="index"
        />
      </div>
    </SectionShell>

    <FooterSection />
  </div>
</template>

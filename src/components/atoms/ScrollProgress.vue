<script setup lang="ts">
import { useElementSize,useWindowScroll, useWindowSize } from '@vueuse/core'
import { computed } from 'vue'

const { y } = useWindowScroll()
const { height: windowHeight } = useWindowSize()
const { height: docHeight } = useElementSize(document.documentElement)

const progress = computed(() => {
    const scrollable = docHeight.value - windowHeight.value
    return scrollable > 0 ? y.value / scrollable : 0
})
</script>

<template>
  <div
    class="fixed inset-x-0 top-0 z-9999 h-0.5 bg-white/10 pointer-events-none"
    role="progressbar"
    :aria-valuenow="Math.round(progress * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
    aria-label="Reading progress"
  >
    <div
      class="size-full origin-left will-change-transform bg-linear-to-r from-accent via-purple-500 to-cyan-400"
      :style="{ transform: `scaleX(${progress})` }"
    />
  </div>
</template>

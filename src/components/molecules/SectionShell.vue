<script setup lang="ts">
import RadialGlow from '@/components/atoms/RadialGlow.vue'

type Position = 'top' | 'center' | 'bottom'
type Intensity = 'subtle' | 'medium'

withDefaults(defineProps<{
    ariaLabel?: string
    glow?: boolean
    glowPosition?: Position
    glowIntensity?: Intensity
    topAccent?: boolean
    allowOverflow?: boolean
}>(), {
    ariaLabel: undefined,
    glow: false,
    glowPosition: 'center',
    glowIntensity: 'subtle',
    topAccent: false,
    allowOverflow: false,
})
</script>

<template>
  <section
    class="relative w-full bg-bg"
    :class="allowOverflow ? 'overflow-visible' : 'overflow-hidden'"
    :aria-label="ariaLabel"
  >
    <div
      v-if="topAccent"
      class="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent"
      aria-hidden="true"
    />

    <RadialGlow
      v-if="glow"
      :position="glowPosition"
      :intensity="glowIntensity"
    />

    <slot />
  </section>
</template>

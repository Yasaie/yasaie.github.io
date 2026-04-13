<script setup lang="ts">
import { rgba } from '@/utils/color'

defineProps<{ color: string }>()
</script>

<template>
  <span
    class="font-ui uppercase text-xs tracking-widest px-2 py-1 rounded-sm"
    :style="{
      border: `1px solid ${rgba(color, 0.3)}`,
      color: color,
      background: rgba(color, 0.07),
    }"
  >
    <slot />
  </span>
</template>

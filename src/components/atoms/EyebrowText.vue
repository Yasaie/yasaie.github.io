<script setup lang="ts">
import { tv } from 'tailwind-variants'

const styles = tv({
    slots: {
        root: 'flex items-center gap-3',
        line: 'h-px w-8 bg-purple-400/25',
        label: 'font-ui text-muted uppercase text-xs tracking-super',
    },
})

const { root, line, label } = styles()
</script>

<template>
  <div :class="root()">
    <div :class="line()" />
    <span :class="label()">
      <slot />
    </span>
    <div :class="line()" />
  </div>
</template>

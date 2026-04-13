<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants'

type StylesProps = VariantProps<typeof styles>

const props = withDefaults(defineProps<{
    position?: StylesProps['position']
    intensity?: StylesProps['intensity']
}>(), {
    position: 'center',
    intensity: 'subtle',
})

const styles = tv({
    base: 'absolute inset-0 pointer-events-none',
    variants: {
        position: {
            top: 'bg-radial-[at_50%_0%]',
            center: 'bg-radial-[at_50%_50%]',
            bottom: 'bg-radial-[at_50%_100%]',
        },
        intensity: {
            subtle: 'from-purple-500/8 to-transparent to-65%',
            medium: 'from-purple-500/12 to-transparent to-65%',
        },
    },
})
</script>

<template>
  <div
    :class="styles(props)"
    aria-hidden="true"
  />
</template>

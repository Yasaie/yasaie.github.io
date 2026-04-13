<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants'

type StylesProps = VariantProps<typeof styles>

const props = withDefaults(defineProps<{
    tag?: string
    size?: StylesProps['size']
}>(), {
    tag: 'h1',
    size: 'xl',
})

const styles = tv({
    base: 'font-display font-bold bg-clip-text text-transparent',
    variants: {
        size: {
            xl: 'text-[clamp(2.6rem,9vw,5.8rem)] md:text-[clamp(3.8rem,7vw,5.8rem)] tracking-widest leading-none',
            lg: 'text-[clamp(1.5rem,6.5vw,3.2rem)] md:text-[clamp(1.8rem,4.5vw,3.2rem)] tracking-widest leading-tight',
        },
    },
    defaultVariants: {
        size: 'xl',
    },
})
</script>

<template>
  <component
    :is="tag"
    :class="styles(props)"
    style="background-image: linear-gradient(135deg, #ffffff 0%, #c4b5fd 25%, #a78bfa 45%, #22d3ee 70%, #e0f2fe 100%);"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { tv, type VariantProps } from 'tailwind-variants'

type StylesProps = VariantProps<typeof styles>

const props = withDefaults(defineProps<{
    line?: StylesProps['line']
    color?: StylesProps['color']
    gap?: StylesProps['gap']
}>(), {
    line: 'flex',
    color: 'default',
    gap: 'md',
})

const styles = tv({
    slots: {
        root: 'flex items-center',
        leftLine: 'bg-linear-to-r from-transparent',
        rightLine: 'bg-linear-to-l from-transparent',
        symbol: 'shrink-0 text-xs tracking-super',
    },
    variants: {
        line: {
            flex: {
                leftLine: 'flex-1 h-px',
                rightLine: 'flex-1 h-px',
            },
            fixed: {
                leftLine: 'h-px w-16',
                rightLine: 'h-px w-16',
            },
        },
        color: {
            default: {
                leftLine: 'to-purple-400/45',
                rightLine: 'to-purple-400/45',
                symbol: 'text-purple-400/55',
            },
            subtle: {
                leftLine: 'to-white/14',
                rightLine: 'to-white/14',
                symbol: 'text-white/25',
            },
            strong: {
                leftLine: 'to-purple-400/55',
                rightLine: 'to-purple-400/55',
                symbol: 'text-purple-400/70',
            },
        },
        gap: {
            md: { root: 'gap-4' },
            lg: { root: 'gap-5' },
        },
    },
    defaultVariants: {
        line: 'flex',
        color: 'default',
        gap: 'md',
    },
})

const { root, leftLine, rightLine, symbol } = styles(props)
</script>

<template>
  <div :class="root()">
    <div :class="leftLine()" />
    <span :class="symbol()">✦</span>
    <div :class="rightLine()" />
  </div>
</template>

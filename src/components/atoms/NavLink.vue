<script setup lang="ts">
defineProps<{
    href: string
    external?: boolean
}>()
</script>

<template>
  <a
    :href="href"
    class="group relative inline-flex flex-col items-center gap-1 font-ui uppercase text-xs tracking-widest text-muted no-underline transition-colors duration-300 hover:text-content"
    v-bind="external ? { target: '_blank', rel: 'noopener noreferrer' } : {}"
  >
    <span><slot /></span>
    <span class="block h-px w-0 rounded-full bg-linear-to-r from-purple-400 to-cyan-400 transition-[width] duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
  </a>
</template>

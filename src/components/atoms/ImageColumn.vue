<script setup lang="ts">
withDefaults(defineProps<{
    src: string
    alt?: string
}>(), {
    alt: '',
})
</script>

<template>
  <div class="image-column absolute inset-y-0 left-0 will-change-transform md:w-auto w-full">
    <img
      :src="src"
      :alt="alt"
      class="size-full object-cover object-top grayscale-[0.08] brightness-[0.45] md:brightness-50"
    >

    <div class="absolute inset-0 pointer-events-none bg-linear-to-t from-bg from-0% to-transparent to-35%" />
    <div class="absolute inset-0 pointer-events-none bg-linear-to-b from-bg from-0% to-transparent to-16%" />
    <div class="absolute inset-0 pointer-events-none md:hidden bg-bg/40" />
  </div>
</template>

<style scoped>
.image-column {
  mask-image: linear-gradient(to right, black 55%, transparent 88%);
  -webkit-mask-image: linear-gradient(to right, black 55%, transparent 88%);
}

@media (max-width: 767px) {
  .image-column {
    mask-image: linear-gradient(to bottom, black 40%, transparent 90%);
    -webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 90%);
  }
}
</style>

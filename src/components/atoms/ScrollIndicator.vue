<template>
  <div class="flex flex-col items-center gap-3">
    <div class="relative w-px h-14 overflow-hidden bg-white/7">
      <div class="absolute left-0 w-full h-[45%] bg-linear-to-b from-transparent via-accent/75 to-transparent animate-[scroll-slide_2.3s_ease-in-out_infinite]" />
    </div>
    <span class="font-ui text-dim uppercase text-xs tracking-widest">
      <slot>Scroll to Read</slot>
    </span>
  </div>
</template>

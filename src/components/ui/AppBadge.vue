<script setup lang="ts">
defineProps<{
  variant?: 'blue' | 'green' | 'red' | 'amber' | 'gray' | 'indigo'
  size?: 'sm' | 'md'
}>()
</script>

<template>
  <span
    class="inline-flex items-center rounded-full font-medium"
    :class="{
      'px-2 py-0.5 text-xs': size === 'sm' || !size,
      'px-3 py-1 text-sm': size === 'md',
      'bg-blue-100 text-blue-700': variant === 'blue' || !variant,
      'bg-green-100 text-green-700': variant === 'green',
      'bg-red-100 text-red-700': variant === 'red',
      'bg-amber-100 text-amber-700': variant === 'amber',
      'bg-gray-100 text-gray-700': variant === 'gray',
      'bg-indigo-100 text-indigo-700': variant === 'indigo',
    }"
  >
    <slot />
  </span>
</template>

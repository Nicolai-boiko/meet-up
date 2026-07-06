<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div class="flex justify-center py-8">
    <div
      class="border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"
      :class="{
        'w-6 h-6': size === 'sm',
        'w-10 h-10': size === 'md' || !size,
        'w-14 h-14': size === 'lg',
      }"
    />
  </div>
</template>

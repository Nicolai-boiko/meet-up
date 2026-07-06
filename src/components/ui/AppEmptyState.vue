<script setup lang="ts">
import AppSpinner from './AppSpinner.vue'

defineProps<{
  loading?: boolean
  text?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
    <AppSpinner v-if="loading" />
    <p class="text-sm">{{ text ?? 'Ничего не найдено' }}</p>
    <slot />
  </div>
</template>

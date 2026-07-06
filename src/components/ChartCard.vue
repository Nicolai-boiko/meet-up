<script setup lang="ts">
import AppEmptyState from './ui/AppEmptyState.vue'

defineProps<{
  title: string
  hasData: boolean
}>()
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-5">
    <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{{ title }}</h3>
    <div v-if="hasData" class="max-h-64">
      <slot />
    </div>
    <AppEmptyState v-else text="Нет данных" />
  </div>
</template>

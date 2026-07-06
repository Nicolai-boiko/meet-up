<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  color: 'blue' | 'green' | 'amber' | 'indigo' | 'teal'
}>()

const colorMap = {
  blue: 'text-blue-500',
  green: 'text-green-500',
  amber: 'text-amber-500',
  indigo: 'text-indigo-500',
  teal: 'text-teal-500',
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4">
    <div class="text-xs uppercase tracking-wide font-medium mb-1" :class="colorMap[color]">
      {{ label }}
    </div>
    <div class="text-2xl font-bold text-gray-800">{{ value }}</div>
  </div>
</template>

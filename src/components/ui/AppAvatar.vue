<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg'
}>()

const colors = [
  '#4F46E5',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#CA8A04',
  '#16A34A',
  '#0891B2',
  '#2563EB',
  '#9333EA',
]

const bgColor = computed(() => {
  let hash = 0
  for (const c of props.name) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0
  return colors[Math.abs(hash) % colors.length]
})

const initials = computed(() => {
  const parts = props.name.trim().split(/\s+/)
  return parts.length >= 2
    ? (parts[0]![0]! + parts[1]![0]!).toUpperCase()
    : props.name.slice(0, 2).toUpperCase()
})

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-12 h-12 text-lg',
}
</script>

<template>
  <div v-if="src" class="rounded-full overflow-hidden shrink-0" :class="sizeClasses[size ?? 'md']">
    <img :src="src" :alt="name" class="w-full h-full object-cover" />
  </div>
  <div
    v-else
    class="rounded-full flex items-center justify-center font-bold text-white shrink-0"
    :class="sizeClasses[size ?? 'md']"
    :style="{ backgroundColor: bgColor }"
    :title="name"
  >
    {{ initials }}
  </div>
</template>

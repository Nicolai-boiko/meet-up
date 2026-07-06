<script setup lang="ts">
import type { Meetup } from '../types'

defineProps<{
  meeting: Meetup
  showDescription?: boolean
}>()

defineEmits<{
  click: [meeting: Meetup]
}>()

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <button
    @click="$emit('click', meeting)"
    class="w-full text-left border rounded-lg p-4 hover:bg-gray-50 transition-colors"
  >
    <h3 class="font-semibold text-gray-800 text-sm">{{ meeting.title }}</h3>
    <p class="text-xs text-gray-500 mt-1">
      {{ formatTime(meeting.startTime) }} – {{ formatTime(meeting.endTime) }}
    </p>
    <p
      v-if="showDescription && meeting.description"
      class="text-gray-600 text-xs mt-2 line-clamp-2"
    >
      {{ meeting.description }}
    </p>
    <p class="text-xs text-gray-400 mt-1">{{ meeting.host?.name || 'Неизвестный' }}</p>
  </button>
</template>

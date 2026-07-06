<script setup lang="ts">
import type { ContentItem } from '../types'

defineProps<{ item: ContentItem; active?: boolean }>()
defineEmits<{ select: [item: ContentItem]; toggleFavorite: [item: ContentItem] }>()

const typeIcons: Record<string, string> = { video: '🎬', link: '🔗', file: '📁', text: '📄' }
</script>

<template>
  <div
    @click="$emit('select', item)"
    class="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
    :class="{ 'bg-blue-50 border-l-4 border-l-blue-500': active }"
  >
    <div class="flex items-center gap-2">
      <span class="text-lg">{{ typeIcons[item.type] ?? '📄' }}</span>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <div class="text-sm font-medium text-gray-800 truncate">{{ item.title }}</div>
          <button
            @click.stop="$emit('toggleFavorite', item)"
            class="shrink-0"
            :class="item.isFavorited ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              />
            </svg>
          </button>
        </div>
        <div class="text-xs text-gray-400 mt-0.5">
          {{ item.author?.name }} · {{ new Date(item.createdAt).toLocaleDateString('ru-RU') }}
        </div>
        <div v-if="item.tags?.length" class="flex flex-wrap gap-1 mt-1">
          <span
            v-for="tag in item.tags"
            :key="tag.id"
            class="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700"
            >{{ tag.name }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

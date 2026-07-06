<script setup lang="ts">
import { ref } from 'vue'
import type { Tag } from '../types'
import AppButton from './ui/AppButton.vue'

const props = defineProps<{
  tags: Tag[]
  selectedIds: number[]
  allowCreate?: boolean
}>()

const emit = defineEmits<{
  'update:selectedIds': [ids: number[]]
  createTag: [name: string]
}>()

const newTagName = ref('')

function toggle(id: number) {
  const idx = props.selectedIds.indexOf(id)
  emit(
    'update:selectedIds',
    idx >= 0 ? props.selectedIds.filter((tid) => tid !== id) : [...props.selectedIds, id],
  )
}

function createAndAdd() {
  const name = newTagName.value.trim()
  if (!name) return
  emit('createTag', name)
  newTagName.value = ''
}
</script>

<template>
  <div class="flex flex-wrap gap-1">
    <button
      v-for="tag in tags"
      :key="tag.id"
      @click="toggle(tag.id)"
      class="px-2 py-0.5 rounded-full text-xs font-medium transition-colors"
      :class="
        selectedIds.includes(tag.id)
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      "
    >
      {{ tag.name }}
    </button>
    <template v-if="allowCreate">
      <input
        v-model="newTagName"
        placeholder="Новый тег"
        class="w-20 border rounded px-1.5 py-0.5 text-xs"
        @keydown.enter.prevent="createAndAdd"
      />
      <AppButton size="sm" variant="secondary" @click="createAndAdd">+</AppButton>
    </template>
  </div>
</template>

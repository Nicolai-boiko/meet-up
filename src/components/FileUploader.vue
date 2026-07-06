<script setup lang="ts">
import { ref } from 'vue'
import AppButton from './ui/AppButton.vue'

const props = defineProps<{
  files: File[]
  existingFiles?: Array<{ id: number; fileName: string; fileSize: number | null }>
}>()

const emit = defineEmits<{
  'update:files': [files: File[]]
  deleteExisting: [fileId: number]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

function onFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) {
    const newFiles = Array.from(input.files)
    emit('update:files', [...props.files, ...newFiles])
    input.value = ''
  }
}

function removeNew(idx: number) {
  const next = props.files.filter((_, i) => i !== idx)
  emit('update:files', next)
}

function formatSize(bytes: number | null) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>

<template>
  <div class="space-y-2">
    <div v-if="existingFiles?.length">
      <div
        v-for="ef in existingFiles"
        :key="ef.id"
        class="flex items-center justify-between text-sm text-gray-600 py-1"
      >
        <span class="truncate">📎 {{ ef.fileName }} ({{ formatSize(ef.fileSize) }})</span>
        <button
          @click="emit('deleteExisting', ef.id)"
          class="text-red-500 hover:text-red-700 text-xs ml-2 shrink-0"
        >
          Удалить
        </button>
      </div>
    </div>
    <div
      v-for="(f, i) in files"
      :key="i"
      class="flex items-center justify-between text-sm text-blue-600 py-1"
    >
      <span class="truncate">📎 {{ f.name }} ({{ formatSize(f.size) }})</span>
      <button @click="removeNew(i)" class="text-red-500 hover:text-red-700 text-xs ml-2 shrink-0">
        Убрать
      </button>
    </div>
    <input ref="inputRef" type="file" multiple class="hidden" @change="onFilesSelected" />
    <AppButton variant="secondary" size="sm" @click="inputRef?.click()">+ Добавить файлы</AppButton>
  </div>
</template>

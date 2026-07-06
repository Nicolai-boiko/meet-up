<script setup lang="ts">
import { ref } from 'vue'
import AppAvatar from './ui/AppAvatar.vue'
import type { UserSummary } from '../types'

const props = defineProps<{
  modelValue: number[]
  users: UserSummary[]
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const open = ref(false)

function toggleUser(id: number) {
  const idx = props.modelValue.indexOf(id)
  const next = idx >= 0 ? props.modelValue.filter((uid) => uid !== id) : [...props.modelValue, id]
  emit('update:modelValue', next)
}

function clear() {
  emit('update:modelValue', [])
  open.value = false
}

function displayName(u: UserSummary) {
  const first = u.firstName
  const last = u.lastName
  if (first && last) return `${first} ${last}`
  if (first) return first
  return u.name
}
</script>

<template>
  <div class="relative">
    <button
      @click="open = !open"
      class="w-full border rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between bg-white hover:border-blue-400 transition-colors"
    >
      <span class="truncate">
        {{ modelValue.length ? `Выбрано: ${modelValue.length}` : (label ?? 'Все пользователи') }}
      </span>
      <svg class="w-4 h-4 text-gray-400 shrink-0 ml-2" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <div
      v-if="open"
      class="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto"
    >
      <label
        v-for="user in users"
        :key="user.id"
        class="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
      >
        <input
          type="checkbox"
          :checked="modelValue.includes(user.id)"
          @change="toggleUser(user.id)"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <AppAvatar :src="user.avatar" :name="user.name" size="sm" />
        <span class="truncate">{{ displayName(user) }}</span>
      </label>
      <div v-if="users.length === 0" class="px-3 py-2 text-sm text-gray-400">Загрузка...</div>
    </div>
    <button
      v-if="modelValue.length"
      @click="clear"
      class="mt-2 text-xs text-blue-600 hover:underline"
    >
      Сбросить фильтр
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  page: number
  totalPages: number
  hasMore: boolean
  loading?: boolean
  label?: string
}>()

const emit = defineEmits<{
  loadMore: []
}>()
</script>

<template>
  <div v-if="hasMore" class="py-3 border-t border-gray-100">
    <button
      @click="emit('loadMore')"
      :disabled="loading"
      class="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
    >
      {{
        loading
          ? 'Загрузка...'
          : (label ?? `Загрузить ещё (${(page - 1) * 20 + 20} из ${totalPages * 20})`)
      }}
    </button>
  </div>
</template>

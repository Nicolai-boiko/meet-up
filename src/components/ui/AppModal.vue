<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const modalRef = ref<HTMLElement | null>(null)
const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (v) => {
    visible.value = v
  },
)
watch(visible, (v) => {
  emit('update:modelValue', v)
})

function close() {
  visible.value = false
}
function onBackdrop(e: MouseEvent) {
  if (e.target === modalRef.value) close()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="modalRef"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      @click.self="onBackdrop"
      @keydown.escape="close"
    >
      <div
        class="bg-white rounded-xl shadow-xl w-full overflow-hidden"
        :class="{
          'max-w-sm': size === 'sm',
          'max-w-lg': size === 'md' || !size,
          'max-w-2xl': size === 'lg',
        }"
      >
        <div
          v-if="title"
          class="flex items-center justify-between px-6 py-4 border-b border-gray-100"
        >
          <h3 class="text-lg font-semibold text-gray-800">{{ title }}</h3>
          <button @click="close" class="text-gray-400 hover:text-gray-600 p-1">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div class="px-6 py-4">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

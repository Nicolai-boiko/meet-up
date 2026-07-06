<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="{
      'px-3 py-1.5 text-sm': size === 'sm' || !size,
      'px-4 py-2 text-sm': size === 'md',
      'px-6 py-3 text-base': size === 'lg',
      'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400':
        variant === 'primary' || !variant,
      'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400': variant === 'secondary',
      'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400': variant === 'danger',
      'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-300': variant === 'ghost',
    }"
  >
    <span
      v-if="loading"
      class="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
    />
    <slot />
  </button>
</template>

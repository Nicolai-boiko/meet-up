<template>
  <Teleport to="body">
    <Transition name="confirm-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-[60] flex items-center justify-center"
        @keydown.escape="cancel"
        tabindex="-1"
        ref="modalRef"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
          <!-- Icon header -->
          <div class="pt-8 pb-4 flex flex-col items-center" :class="headerClass">
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              :class="iconBgClass"
            >
              <!-- Danger icon -->
              <svg v-if="variant === 'danger'" class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <!-- Warning icon -->
              <svg v-else-if="variant === 'warning'" class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01" />
              </svg>
              <!-- Info icon -->
              <svg v-else class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke-width="2" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16v-4m0-4h.01" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 text-center px-6">{{ title }}</h3>
          </div>

          <!-- Body -->
          <div class="px-6 pb-2">
            <p v-if="message" class="text-sm text-gray-500 text-center leading-relaxed">{{ message }}</p>
          </div>

          <!-- Actions -->
          <div class="px-6 pb-6 pt-4 flex gap-3">
            <button
              @click="cancel"
              class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              {{ cancelText }}
            </button>
            <button
              @click="confirm"
              class="flex-1 px-4 py-2.5 text-white font-medium rounded-xl transition-colors text-sm"
              :class="confirmBtnClass"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';

export interface ConfirmOptions {
  title: string;
  message?: string;
  variant?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

const visible = ref(false);
const modalRef = ref<HTMLElement | null>(null);
const title = ref('');
const message = ref('');
const variant = ref<'danger' | 'warning' | 'info'>('info');
const confirmText = ref('Подтвердить');
const cancelText = ref('Отмена');

let resolvePromise: ((value: boolean) => void) | null = null;

const headerClass = computed(() => {
  switch (variant.value) {
    case 'danger': return 'text-red-600';
    case 'warning': return 'text-amber-600';
    default: return 'text-blue-600';
  }
});

const iconBgClass = computed(() => {
  switch (variant.value) {
    case 'danger': return 'bg-red-50';
    case 'warning': return 'bg-amber-50';
    default: return 'bg-blue-50';
  }
});

const confirmBtnClass = computed(() => {
  switch (variant.value) {
    case 'danger': return 'bg-red-500 hover:bg-red-600';
    case 'warning': return 'bg-amber-500 hover:bg-amber-600';
    default: return 'bg-blue-600 hover:bg-blue-700';
  }
});

function show(opts: ConfirmOptions): Promise<boolean> {
  title.value = opts.title;
  message.value = opts.message ?? '';
  variant.value = opts.variant ?? 'info';
  confirmText.value = opts.confirmText ?? 'Подтвердить';
  cancelText.value = opts.cancelText ?? 'Отмена';
  visible.value = true;
  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
}

watch(visible, async (val) => {
  if (val) {
    await nextTick();
    modalRef.value?.focus();
  }
});

function confirm() {
  visible.value = false;
  resolvePromise?.(true);
  resolvePromise = null;
}

function cancel() {
  visible.value = false;
  resolvePromise?.(false);
  resolvePromise = null;
}

defineExpose({ show });
</script>

<style scoped>
.confirm-fade-enter-active,
.confirm-fade-leave-active {
  transition: all 0.2s ease;
}
.confirm-fade-enter-active > div:last-child,
.confirm-fade-leave-active > div:last-child {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.confirm-fade-enter-from {
  opacity: 0;
}
.confirm-fade-enter-from > div:last-child {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
.confirm-fade-leave-to {
  opacity: 0;
}
.confirm-fade-leave-to > div:last-child {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}
</style>

import { ref, type Ref } from 'vue';
import type { ConfirmOptions } from '../components/ConfirmModal.vue';

const modalRef: Ref<{ show: (opts: ConfirmOptions) => Promise<boolean> } | null> = ref(null);

export function registerConfirmModal(ref: { show: (opts: ConfirmOptions) => Promise<boolean> }) {
  modalRef.value = ref;
}

export function useConfirm() {
  function confirm(title: string, message?: string, variant?: ConfirmOptions['variant']): Promise<boolean> {
    if (!modalRef.value) {
      return Promise.resolve(window.confirm(message ? `${title}\n\n${message}` : title));
    }
    return modalRef.value.show({
      title,
      message,
      variant: variant ?? 'info',
    });
  }

  return { confirm };
}

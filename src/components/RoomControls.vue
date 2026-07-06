<script setup lang="ts">
defineProps<{
  isMuted: boolean
  isVideoOff: boolean
  isScreenSharing: boolean
  showChat: boolean
  unreadCount: number
}>()

defineEmits<{
  toggleMute: []
  toggleVideo: []
  toggleScreenShare: []
  toggleChat: []
  leave: []
}>()
</script>

<template>
  <footer
    class="bg-gray-800 px-4 py-3 flex items-center justify-center gap-3 border-t border-gray-700 shrink-0"
  >
    <button
      @click="$emit('toggleMute')"
      class="control-btn"
      :class="isMuted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'"
      title="Микрофон"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          v-if="!isMuted"
          fill-rule="evenodd"
          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
          clip-rule="evenodd"
        />
        <path
          v-else
          d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0012 8V7a1 1 0 012 0v1zM5.172 2.172a4 4 0 00-.172.656V8a5 5 0 001.533 3.693l.821-.822A3 3 0 018 5.828V4a3 3 0 015.9-.828l1.072-1.072A4.97 4.97 0 0010 2.07V1H9v1.07A7.001 7.001 0 003 8a1 1 0 002 0 5 5 0 01.172-1.172L3.707 5.363l1.465-3.191z"
        />
      </svg>
    </button>
    <button
      @click="$emit('toggleVideo')"
      class="control-btn"
      :class="isVideoOff ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'"
      title="Камера"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          v-if="!isVideoOff"
          d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"
        />
        <path
          v-else
          d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1zM3 3l14 14"
        />
      </svg>
    </button>
    <button
      @click="$emit('toggleChat')"
      class="control-btn relative bg-gray-700 hover:bg-gray-600"
      title="Чат"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
          clip-rule="evenodd"
        />
      </svg>
      <span
        v-if="unreadCount"
        class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center"
        >{{ unreadCount }}</span
      >
    </button>
    <button
      @click="$emit('toggleScreenShare')"
      class="control-btn"
      :class="isScreenSharing ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'"
      title="Демонстрация экрана"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <button
      @click="$emit('leave')"
      class="control-btn bg-red-600 hover:bg-red-700 ml-4"
      title="Выйти"
    >
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </footer>
</template>

<style scoped>
.control-btn {
  @apply w-11 h-11 rounded-full flex items-center justify-center text-white transition-colors;
}
</style>

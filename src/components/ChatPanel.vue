<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import AppAvatar from './ui/AppAvatar.vue'

interface ChatMessage {
  id: string
  socketId: string
  text: string
  userName: string
  initials: string
  avatar: string | null
  timestamp: string
}

const props = defineProps<{
  messages: ChatMessage[]
  ownSocketId: string
}>()

defineEmits<{
  send: [text: string]
}>()

const text = ref('')
const listRef = ref<HTMLElement | null>(null)

function submit() {
  const trimmed = text.value.trim()
  if (!trimmed) return
  emit('send', trimmed)
  text.value = ''
}

watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      listRef.value?.scrollTo({ top: listRef.value.scrollHeight })
    })
  },
)

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <aside class="w-72 bg-gray-800 border-l border-gray-700 flex flex-col shrink-0">
    <div class="px-3 py-2 border-b border-gray-700 text-gray-200 text-sm font-semibold">Чат</div>
    <div ref="listRef" class="flex-1 overflow-y-auto p-3 space-y-3">
      <div v-if="messages.length === 0" class="text-gray-500 text-sm text-center py-8">
        Сообщений пока нет
      </div>
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="flex gap-2"
        :class="msg.socketId === ownSocketId ? 'flex-row-reverse' : ''"
      >
        <AppAvatar :src="msg.avatar" :name="msg.userName" size="sm" />
        <div
          class="rounded-lg px-3 py-2 text-sm max-w-[75%]"
          :class="
            msg.socketId === ownSocketId ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
          "
        >
          <div class="text-xs opacity-70 mb-0.5">{{ msg.userName }}</div>
          <div class="break-words">{{ msg.text }}</div>
          <div class="text-[10px] opacity-50 mt-1">{{ formatTime(msg.timestamp) }}</div>
        </div>
      </div>
    </div>
    <form @submit.prevent="submit" class="p-3 border-t border-gray-700 flex gap-2">
      <input
        v-model="text"
        type="text"
        placeholder="Сообщение..."
        class="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        class="shrink-0 w-9 h-9 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
          />
        </svg>
      </button>
    </form>
  </aside>
</template>

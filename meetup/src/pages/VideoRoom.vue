<template>
  <div class="h-full -mx-6 -my-6 bg-gray-900 flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700 shrink-0">
      <div class="flex items-center gap-4">
        <router-link to="/home" class="text-gray-400 hover:text-white transition-colors">
          ← Назад
        </router-link>
        <h1 class="text-white text-lg font-semibold truncate max-w-md">
          {{ roomTitle }}
        </h1>
      </div>
      <div class="flex items-center gap-3 text-gray-400 text-sm">
        <span class="flex items-center gap-1">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
          {{ participants.length + 1 }}
        </span>
        <div v-if="isConnecting" class="flex items-center gap-1">
          <span class="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
          Подключение...
        </div>
        <div v-else class="flex items-center gap-1">
          <span class="w-2 h-2 bg-green-400 rounded-full"></span>
          В эфире
        </div>
      </div>
    </header>

    <!-- Room not found -->
    <div
      v-if="roomNotFound"
      class="bg-red-500/15 border-b border-red-500/30 px-4 py-6 flex flex-col items-center gap-3 shrink-0"
    >
      <svg class="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <span class="text-red-300 text-sm">Комната не найдена. Проверьте ссылку или создайте новую.</span>
      <router-link to="/create-call" class="text-red-300 text-sm underline hover:text-red-200">← К созданию комнат</router-link>
    </div>

    <!-- Media banner -->
    <div
      v-if="!localStream && !isConnecting"
      class="bg-yellow-500/15 border-b border-yellow-500/30 px-4 py-2 flex items-center justify-between shrink-0"
    >
      <span class="text-yellow-300 text-sm">Вы подключены без камеры и микрофона</span>
      <div class="flex gap-2">
        <button
          @click="enableMedia({ audio: true, video: false })"
          class="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-md hover:bg-yellow-500/30 transition-colors"
        >
          Только микрофон
        </button>
        <button
          @click="enableMedia({ audio: true, video: true })"
          class="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 rounded-md hover:bg-yellow-500/30 transition-colors"
        >
          Камера и микрофон
        </button>
      </div>
    </div>

    <!-- Main content area -->
    <div class="flex-1 px-4 py-3 overflow-hidden min-h-0 relative flex flex-col">

      <!-- SCREEN SHARING MODE: local is sharing -->
      <template v-if="isScreenSharing">
        <div class="flex-1 min-h-0 rounded-xl overflow-hidden bg-black relative">
          <video ref="screenVideoEl" autoplay muted playsinline class="w-full h-full object-contain"></video>
          <div class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">Демонстрация экрана</div>
        </div>
        <!-- Participant thumbnails at bottom -->
        <div class="flex gap-2 mt-2 h-24 shrink-0 overflow-x-auto">
          <div
            v-for="p in participants"
            :key="p.socketId"
            class="relative w-32 shrink-0 bg-gray-800 rounded-lg overflow-hidden"
          >
            <video v-if="p.stream" autoplay playsinline class="w-full h-full object-cover" :srcObject="p.stream"></video>
            <div v-else class="w-full h-full flex items-center justify-center bg-gray-700">
              <div class="text-white text-xs font-bold" :style="{ backgroundColor: remoteAvatarColor(p.socketId) }" style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px">{{ p.initials }}</div>
            </div>
          </div>
        </div>
        <!-- Self-view PiP -->
        <div v-show="localStream && showSelfView" class="absolute bottom-24 right-2 w-40 aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-blue-400 z-10">
          <video ref="selfVideoEl" autoplay muted playsinline class="w-full h-full object-cover mirror"></video>
          <div v-if="!localStream || isVideoOff" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-700">
            <template v-if="authStore.profile?.avatar">
              <img :src="authStore.profile.avatar" class="w-12 h-12 rounded-full object-cover mb-1 border-2 border-gray-500" />
            </template>
            <template v-else>
              <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white mb-1" :style="{ backgroundColor: localAvatarColor }">{{ authStore.initials }}</div>
            </template>
            <span class="text-gray-200 text-xs font-medium">{{ authStore.displayName }}</span>
          </div>
          <button @click="showSelfView = false" class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] hover:bg-black/70">✕</button>
        </div>
      </template>

      <!-- NORMAL MODE -->
      <template v-else>
        <div class="flex-1 min-h-0 relative">
          <div class="grid gap-3 h-full auto-rows-fr" :class="gridClass">
            <div v-for="p in participants" :key="p.socketId" class="relative bg-gray-800 rounded-xl overflow-hidden group min-h-0">
              <video v-if="p.stream" autoplay playsinline class="w-full h-full object-cover" :srcObject="p.stream"></video>
              <div v-if="!p.stream || p.isVideoOff" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-700">
                <template v-if="p.avatar">
                  <img :src="p.avatar" class="w-16 h-16 rounded-full object-cover mb-2 border-2 border-gray-500" />
                </template>
                <template v-else>
                  <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-2" :style="{ backgroundColor: remoteAvatarColor(p.socketId) }">{{ p.initials }}</div>
                </template>
                <span class="text-gray-300 text-sm">{{ p.displayName || p.userName }}</span>
              </div>
              <div v-if="p.isMuted" class="absolute top-2 right-2 bg-red-500 rounded-full p-1">
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 01-16 0h2a6 6 0 0012 0h2zm-8 6a8.003 8.003 0 01-7.07-4H5a6 6 0 0010 0h2.07A8.014 8.014 0 0110 16z" clip-rule="evenodd" /></svg>
              </div>
            </div>
            <div v-if="participants.length === 0 && !isConnecting" class="col-span-full flex flex-col items-center justify-center text-gray-500 gap-3">
              <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
              <span>Ожидание участников...</span>
            </div>
          </div>
          <!-- Self-view PiP -->
          <div v-show="localStream && showSelfView" class="absolute bottom-2 right-2 w-48 sm:w-56 aspect-video bg-gray-800 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-600 hover:border-blue-400 transition-colors group/self z-10">
            <video ref="selfVideoEl" autoplay muted playsinline class="w-full h-full object-cover mirror"></video>
            <div v-if="!localStream || isVideoOff" class="absolute inset-0 flex flex-col items-center justify-center bg-gray-700">
              <template v-if="authStore.profile?.avatar">
                <img :src="authStore.profile.avatar" class="w-16 h-16 rounded-full object-cover mb-2 border-2 border-gray-500" />
              </template>
              <template v-else>
                <div class="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-2" :style="{ backgroundColor: localAvatarColor }">{{ authStore.initials }}</div>
              </template>
              <span class="text-gray-200 text-sm font-medium">{{ authStore.displayName }}</span>
            </div>
            <button @click="showSelfView = false" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/self:opacity-100 transition-opacity hover:bg-black/70" title="Скрыть">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
          </div>
          <button v-if="localStream && !showSelfView" @click="showSelfView = true" class="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors z-10 shadow-lg" title="Показать себя">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
          </button>
        </div>
      </template>

    </div>

    <!-- Control Bar -->
    <footer class="bg-gray-800 px-4 py-3 flex items-center justify-center gap-4 border-t border-gray-700 shrink-0">
      <button
        @click="toggleMute"
        :disabled="!localStream"
        :class="[
          'control-btn',
          !localStream ? 'bg-gray-700 opacity-50 cursor-not-allowed' :
          isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
        ]"
        :title="!localStream ? 'Нет доступа к микрофону' : isMuted ? 'Включить микрофон' : 'Выключить микрофон'"
      >
        <svg v-if="!isMuted" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 01-12 0H3a7.001 7.001 0 006 6.93V17H6v1h8v-1h-3v-2.07z" clip-rule="evenodd" />
        </svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 01-16 0h2a6 6 0 0012 0h2zm-8 6a8.003 8.003 0 01-7.07-4H5a6 6 0 0010 0h2.07A8.014 8.014 0 0110 16z" clip-rule="evenodd" />
        </svg>
      </button>

      <button
        @click="toggleVideo"
        :disabled="!localStream"
        :class="[
          'control-btn',
          !localStream ? 'bg-gray-700 opacity-50 cursor-not-allowed' :
          isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'
        ]"
        :title="!localStream ? 'Нет доступа к камере' : isVideoOff ? 'Включить камеру' : 'Выключить камеру'"
      >
        <svg v-if="!isVideoOff" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
        <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.106.212A1 1 0 0014 7v6a1 1 0 00.553.894l2 1A1 1 0 0018 14V6a1 1 0 00-1.447-.894l-2 1z" clip-rule="evenodd" />
        </svg>
      </button>

      <button
        @click="toggleScreenShare"
        :class="[
          'control-btn',
          isScreenSharing ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-500'
        ]"
        :title="isScreenSharing ? 'Остановить демонстрацию' : 'Демонстрация экрана'"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
        </svg>
      </button>

      <button
        @click="handleLeave"
        class="control-btn bg-red-500 hover:bg-red-600"
        title="Покинуть комнату"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 2a1 1 0 00-1 1v7a1 1 0 102 0V3a1 1 0 00-1-1zM4.929 5.515A8 8 0 1018 10H16a6 6 0 11-12 0H4.929z" clip-rule="evenodd" />
        </svg>
      </button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, onUpdated, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWebRTC } from '../composables/useWebRTC';
import { useAuthStore } from '../stores/auth';
import apiClient from '../api';
import type { Room } from '../types';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const roomSlug = route.params.slug as string;
const roomTitle = ref('Комната');
const selfVideoEl = ref<HTMLVideoElement | null>(null);
const screenVideoEl = ref<HTMLVideoElement | null>(null);
const showSelfView = ref(true);

const {
  localStream,
  screenStream,
  participants,
  isMuted,
  isVideoOff,
  isScreenSharing,
  isConnecting,
  joinRoom,
  enableMedia,
  leaveRoom,
  toggleMute,
  toggleVideo,
  toggleScreenShare,
} = useWebRTC(roomSlug, authStore.displayName, authStore.initials);

const AVATAR_COLORS = ['#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#0891B2', '#2563EB', '#9333EA'];

const localAvatarColor = computed(() => {
  const id = authStore.profile?.id ?? 0;
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
});

function remoteAvatarColor(socketId: string) {
  let hash = 0;
  for (const c of socketId) hash = ((hash << 5) - hash + c.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const gridClass = computed(() => {
  const count = participants.value.length;
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-2';
  if (count <= 4) return 'grid-cols-2';
  if (count <= 9) return 'grid-cols-3';
  return 'grid-cols-4';
});

// Rebind streams whenever template re-renders (mode switches destroy/recreate video elements)
function bindStreams() {
  if (selfVideoEl.value && localStream.value) {
    selfVideoEl.value.srcObject = localStream.value;
  }
  if (screenVideoEl.value && screenStream.value) {
    screenVideoEl.value.srcObject = screenStream.value;
  }
}

watch([localStream, screenStream], () => nextTick().then(bindStreams));
onUpdated(() => nextTick().then(bindStreams));

const roomNotFound = ref(false);

async function fetchRoomInfo() {
  try {
    const { data } = await apiClient.get<Room>(`/rooms/${roomSlug}`);
    roomTitle.value = data.title;
  } catch (e: any) {
    if (e.response?.status === 404) {
      roomNotFound.value = true;
    }
    roomTitle.value = roomSlug;
  }
}

async function handleLeave() {
  await leaveRoom();
  router.push('/home');
}

onMounted(async () => {
  await fetchRoomInfo();
  await joinRoom();
});

onBeforeUnmount(async () => {
  await leaveRoom();
});
</script>

<style scoped>
.control-btn {
  padding: 0.75rem;
  border-radius: 9999px;
  color: white;
  transition: all 0.2s;
  outline: none;
}
.control-btn:focus {
  box-shadow: 0 0 0 2px #60a5fa;
}
.mirror {
  transform: scaleX(-1);
}
</style>

<template>
  <div class="space-y-8">
    <!-- Create / Join Room -->
    <section class="bg-white dark:bg-gray-900 dark:bg-gray-900 rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        {{ $t('createCall.title') }}
      </h2>
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 flex flex-col gap-2">
          <div class="flex gap-2">
            <input
              v-model="newRoomSlug"
              type="text"
              :placeholder="$t('createCall.roomNamePlaceholder')"
              class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              @keyup.enter="createAndJoin"
            />
            <button
              @click="createAndJoin"
              :disabled="!newRoomSlug.trim() || creating"
              class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              {{ creating ? $t('createCall.creating') : $t('createCall.create') }}
            </button>
          </div>
          <input
            v-model="roomPassword"
            type="text"
            :placeholder="$t('createCall.passwordOptional')"
            class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div class="flex-1 flex gap-2">
          <input
            v-model="joinSlug"
            type="text"
            :placeholder="$t('createCall.joinPlaceholder')"
            class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            @keyup.enter="joinRoom"
          />
          <button
            @click="joinRoom"
            :disabled="!joinSlug.trim() || joining"
            class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {{ joining ? $t('createCall.joining') : $t('createCall.join') }}
          </button>
        </div>
      </div>
      <p v-if="roomError" class="text-red-500 text-sm mt-2">{{ roomError }}</p>
      <p v-if="joinError" class="text-red-500 text-sm mt-2">{{ joinError }}</p>
    </section>

    <!-- Upcoming Meetups -->
    <section
      v-if="meetupStore.upcomingMeetups.length"
      class="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6"
    >
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        {{ $t('createCall.upcomingTitle') }}
      </h2>
      <div class="space-y-3">
        <div
          v-for="meetup in meetupStore.upcomingMeetups"
          :key="meetup.id"
          class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <h3 class="font-semibold text-gray-800 dark:text-white">{{ meetup.title }}</h3>
          <p class="text-sm text-gray-500 dark:text-white mt-1">{{ meetup.startTime }}</p>
          <p v-if="meetup.description" class="text-gray-600 dark:text-white mt-2">
            {{ meetup.description }}
          </p>
        </div>
      </div>
    </section>

    <div v-if="meetupStore.loading" class="text-center text-gray-500 dark:text-white py-8">
      {{ $t('common.loading') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMeetupStore } from '../stores/meetup'
import apiClient from '../api'

const router = useRouter()
const meetupStore = useMeetupStore()

const newRoomSlug = ref('')
const roomPassword = ref('')
const joinSlug = ref('')
const creating = ref(false)
const joining = ref(false)
const roomError = ref<string | null>(null)
const joinError = ref<string | null>(null)

async function createAndJoin() {
  const slug = newRoomSlug.value.trim()
  if (!slug) return
  creating.value = true
  roomError.value = null
  try {
    const payload: { title: string; slug: string; password?: string } = { title: slug, slug }
    if (roomPassword.value.trim()) payload.password = roomPassword.value.trim()
    await apiClient.post('/rooms', payload)
    router.push(`/room/${slug}`)
  } catch (e: unknown) {
    const err = e as { response?: { status?: number; data?: { message?: string } } }
    if (err.response?.status === 409) {
      // Room exists and is active — suggest joining
      roomError.value = err.response?.data?.message || 'Комната уже существует'
    } else {
      roomError.value = err.response?.data?.message || 'Ошибка создания комнаты'
    }
  } finally {
    creating.value = false
  }
}

async function joinRoom() {
  const slug = joinSlug.value.trim()
  if (!slug) return
  joining.value = true
  joinError.value = null
  try {
    await apiClient.get(`/rooms/${slug}`)
    router.push(`/room/${slug}`)
  } catch (e: unknown) {
    const err = e as { response?: { status?: number } }
    if (err.response?.status === 404) {
      joinError.value = 'Комната не найдена. Проверьте название.'
    } else {
      joinError.value = 'Ошибка подключения к комнате'
    }
  } finally {
    joining.value = false
  }
}

onMounted(() => {
  meetupStore.fetchMeetups()
})
</script>

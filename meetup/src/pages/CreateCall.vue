<template>
  <div class="space-y-8">
    <!-- Create / Join Room -->
    <section class="bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Видео-комнаты</h2>
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1 flex gap-2">
          <input
            v-model="newRoomSlug"
            type="text"
            placeholder="Название комнаты (slug)"
            class="border rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            @keyup.enter="createAndJoin"
          />
          <button
            @click="createAndJoin"
            :disabled="!newRoomSlug.trim() || creating"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {{ creating ? 'Создание...' : 'Создать' }}
          </button>
        </div>
        <div class="flex-1 flex gap-2">
          <input
            v-model="joinSlug"
            type="text"
            placeholder="Slug комнаты для входа"
            class="border rounded-lg px-4 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
            @keyup.enter="joinRoom"
          />
          <button
            @click="joinRoom"
            :disabled="!joinSlug.trim() || joining"
            class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            {{ joining ? 'Поиск...' : 'Войти' }}
          </button>
        </div>
      </div>
      <p v-if="roomError" class="text-red-500 text-sm mt-2">{{ roomError }}</p>
      <p v-if="joinError" class="text-red-500 text-sm mt-2">{{ joinError }}</p>
    </section>

    <!-- Upcoming Meetups -->
    <section v-if="meetupStore.upcomingMeetups.length" class="bg-white rounded-xl shadow-sm p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Предстоящие митапы</h2>
      <div class="space-y-3">
        <div
          v-for="meetup in meetupStore.upcomingMeetups"
          :key="meetup.id"
          class="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <h3 class="font-semibold text-gray-800">{{ meetup.title }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ meetup.date }}</p>
          <p v-if="meetup.description" class="text-gray-600 mt-2">{{ meetup.description }}</p>
        </div>
      </div>
    </section>

    <div v-if="meetupStore.loading" class="text-center text-gray-500 py-8">Загрузка...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMeetupStore } from '../stores/meetup';
import apiClient from '../api';

const router = useRouter();
const meetupStore = useMeetupStore();

const newRoomSlug = ref('');
const joinSlug = ref('');
const creating = ref(false);
const joining = ref(false);
const roomError = ref<string | null>(null);
const joinError = ref<string | null>(null);

async function createAndJoin() {
  const slug = newRoomSlug.value.trim();
  if (!slug) return;
  creating.value = true;
  roomError.value = null;
  try {
    await apiClient.post('/rooms', { title: slug, slug });
    router.push(`/room/${slug}`);
  } catch (e: any) {
    if (e.response?.status === 409) {
      // Room exists and is active — suggest joining
      roomError.value = e.response?.data?.message || 'Комната уже существует';
    } else {
      roomError.value = e.response?.data?.message || 'Ошибка создания комнаты';
    }
  } finally {
    creating.value = false;
  }
}

async function joinRoom() {
  const slug = joinSlug.value.trim();
  if (!slug) return;
  joining.value = true;
  joinError.value = null;
  try {
    await apiClient.get(`/rooms/${slug}`);
    router.push(`/room/${slug}`);
  } catch (e: any) {
    if (e.response?.status === 404) {
      joinError.value = 'Комната не найдена. Проверьте название.';
    } else {
      joinError.value = 'Ошибка подключения к комнате';
    }
  } finally {
    joining.value = false;
  }
}

onMounted(() => {
  meetupStore.fetchMeetups();
});
</script>
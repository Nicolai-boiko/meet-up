<template>
  <div class="h-full -mx-6 -my-6 bg-gray-50 flex flex-col overflow-hidden">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
      <h1 class="text-xl font-bold text-gray-800">Админ-панель</h1>
    </div>

    <!-- Tabs -->
    <div class="bg-white border-b border-gray-200 px-6 flex gap-0 shrink-0">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="switchTab(tab.key)"
        class="px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px"
        :class="activeTab === tab.key
          ? 'text-blue-600 border-blue-600'
          : 'text-gray-500 border-transparent hover:text-gray-700'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6">

      <!-- Users Tab -->
      <div v-if="activeTab === 'users'">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Пользователь</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Роль</th>
                <th class="text-right px-4 py-3 font-medium text-gray-500">Действия</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="user in adminUsers" :key="user.id">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <img v-if="user.avatar" :src="user.avatar" class="w-7 h-7 rounded-full object-cover" />
                    <div v-else class="w-7 h-7 rounded-full bg-blue-400 flex items-center justify-center text-[11px] font-bold text-white">
                      {{ userInitials(user) }}
                    </div>
                    <span class="font-medium text-gray-800">{{ userDisplayName(user) }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ user.email }}</td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-0.5 text-xs rounded-full font-medium"
                    :class="user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    v-if="user.role !== 'ADMIN'"
                    @click="promoteUser(user)"
                    class="text-xs text-blue-600 hover:underline mr-3"
                  >
                    Сделать админом
                  </button>
                  <button
                    v-if="user.role === 'ADMIN'"
                    @click="demoteUser(user)"
                    class="text-xs text-amber-600 hover:underline mr-3"
                  >
                    Понизить до USER
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Content Tab -->
      <div v-if="activeTab === 'content'">
        <div v-if="adminContent.loading" class="text-center text-gray-500 py-8">Загрузка...</div>
        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
          <!-- Bulk action bar -->
          <div
            class="flex items-center gap-3 px-4 py-2 border-b transition-colors"
            :class="selectedContentIds.length ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'"
          >
            <template v-if="selectedContentIds.length">
              <span class="text-sm text-red-700">
                Выбрано: {{ selectedContentIds.length }} {{ pluralize(selectedContentIds.length, 'материал', 'материала', 'материалов') }}
              </span>
              <button
                @click="deleteSelectedContent"
                class="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Удалить выбранные
              </button>
              <button
                @click="selectedContentIds = []"
                class="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Отменить
              </button>
            </template>
            <template v-else>
              <span class="text-sm text-gray-400">Выберите материалы для удаления</span>
            </template>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="w-10 px-2 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedContentIds.length === adminContent.items.length && adminContent.items.length > 0"
                    @change="toggleAllContent"
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Название</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Тип</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Автор</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Дата</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="item in adminContent.items" :key="item.id">
                <td class="w-10 px-2 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedContentIds.includes(item.id)"
                    @change="toggleContentSelect(item.id)"
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="px-4 py-3 font-medium text-gray-800 max-w-48 truncate">{{ item.title }}</td>
                <td class="px-4 py-3 text-gray-500">{{ item.type }}</td>
                <td class="px-4 py-3 text-gray-500">{{ item.author?.name }}</td>
                <td class="px-4 py-3 text-gray-500">{{ formatDate(item.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Rooms Tab -->
      <div v-if="activeTab === 'rooms'">
        <div v-if="adminRooms.loading" class="text-center text-gray-500 py-8">Загрузка...</div>
        <div v-else class="bg-white rounded-xl shadow-sm overflow-hidden">
          <!-- Bulk action bar -->
          <div
            class="flex items-center gap-3 px-4 py-2 border-b transition-colors"
            :class="selectedRoomIds.length ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'"
          >
            <template v-if="selectedRoomIds.length">
              <span class="text-sm text-red-700">
                Выбрано: {{ selectedRoomIds.length }} {{ pluralize(selectedRoomIds.length, 'комната', 'комнаты', 'комнат') }}
              </span>
              <button
                @click="deleteSelectedRooms"
                class="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Удалить выбранные
              </button>
              <button
                @click="selectedRoomIds = []"
                class="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
              >
                Отменить
              </button>
            </template>
            <template v-else>
              <span class="text-sm text-gray-400">Выберите комнаты для удаления</span>
            </template>
          </div>
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="w-10 px-2 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedRoomIds.length === adminRooms.items.length && adminRooms.items.length > 0"
                    @change="toggleAllRooms"
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Комната</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Slug</th>
                <th class="text-left px-4 py-3 font-medium text-gray-500">Статус</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="room in adminRooms.items" :key="room.id">
                <td class="w-10 px-2 py-3">
                  <input
                    type="checkbox"
                    :checked="selectedRoomIds.includes(room.id)"
                    @change="toggleRoomSelect(room.id)"
                    class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td class="px-4 py-3 font-medium text-gray-800">{{ room.title }}</td>
                <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ room.slug }}</td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-0.5 text-xs rounded-full font-medium"
                    :class="room.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ room.isActive ? 'Активна' : 'Неактивна' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useConfirm } from '../composables/useConfirm';
import apiClient from '../api';
import type { UserSummary, ContentItem, Room, PaginatedResponse } from '../types';

const { confirm } = useConfirm();

const authStore = useAuthStore();
const router = useRouter();

const tabs = [
  { key: 'users', label: 'Пользователи' },
  { key: 'content', label: 'Библиотека' },
  { key: 'rooms', label: 'Комнаты' },
] as const;
const activeTab = ref<'users' | 'content' | 'rooms'>('users');

function switchTab(tab: typeof activeTab.value) {
  activeTab.value = tab;
  if (tab === 'content') loadContent();
  if (tab === 'rooms') loadRooms();
}

// ── Users ──
const adminUsers = ref<UserSummary[]>([]);

async function loadUsers() {
  try {
    const { data } = await apiClient.get<UserSummary[]>('/users');
    adminUsers.value = data;
  } catch (e) {
    console.error('loadUsers error:', e);
  }
}

async function promoteUser(user: UserSummary) {
  const ok = await confirm('Назначить администратором?', `${userDisplayName(user)} получит полный доступ к управлению.`, 'warning');
  if (!ok) return;
  await apiClient.put(`/users/${user.id}/role`, { role: 'ADMIN' });
  await loadUsers();
}

async function demoteUser(user: UserSummary) {
  const ok = await confirm('Понизить до USER?', `${userDisplayName(user)} потеряет права администратора.`, 'warning');
  if (!ok) return;
  await apiClient.put(`/users/${user.id}/role`, { role: 'USER' });
  await loadUsers();
}

// ── Content ──
const adminContent = reactive({
  items: [] as ContentItem[],
  loading: false,
});

const selectedContentIds = ref<number[]>([]);

function toggleContentSelect(id: number) {
  const idx = selectedContentIds.value.indexOf(id);
  if (idx >= 0) {
    selectedContentIds.value = selectedContentIds.value.filter((i) => i !== id);
  } else {
    selectedContentIds.value = [...selectedContentIds.value, id];
  }
}

function toggleAllContent() {
  if (selectedContentIds.value.length === adminContent.items.length) {
    selectedContentIds.value = [];
  } else {
    selectedContentIds.value = adminContent.items.map((i) => i.id);
  }
}

async function deleteSelectedContent() {
  if (!selectedContentIds.value.length) return;
  const count = selectedContentIds.value.length;
  const ok = await confirm(
    `Удалить выбранные материалы?`,
    `${count} ${pluralize(count, 'материал', 'материала', 'материалов')} будут удалены безвозвратно.`,
    'danger',
  );
  if (!ok) return;
  await apiClient.post('/content/bulk-delete', { ids: selectedContentIds.value });
  adminContent.items = adminContent.items.filter((i) => !selectedContentIds.value.includes(i.id));
  selectedContentIds.value = [];
}

async function loadContent() {
  adminContent.loading = true;
  try {
    const { data } = await apiClient.get<PaginatedResponse<ContentItem>>('/content', { params: { limit: 100 } });
    adminContent.items = data.items;
    selectedContentIds.value = [];
  } catch (e) {
    console.error('loadContent error:', e);
  } finally {
    adminContent.loading = false;
  }
}

// ── Rooms ──
const adminRooms = reactive({
  items: [] as Room[],
  loading: false,
});

const selectedRoomIds = ref<number[]>([]);

function toggleRoomSelect(id: number) {
  const idx = selectedRoomIds.value.indexOf(id);
  if (idx >= 0) {
    selectedRoomIds.value = selectedRoomIds.value.filter((i) => i !== id);
  } else {
    selectedRoomIds.value = [...selectedRoomIds.value, id];
  }
}

function toggleAllRooms() {
  if (selectedRoomIds.value.length === adminRooms.items.length) {
    selectedRoomIds.value = [];
  } else {
    selectedRoomIds.value = adminRooms.items.map((r) => r.id);
  }
}

async function deleteSelectedRooms() {
  if (!selectedRoomIds.value.length) return;
  const count = selectedRoomIds.value.length;
  const ok = await confirm(
    `Удалить выбранные комнаты?`,
    `${count} ${pluralize(count, 'комната', 'комнаты', 'комнат')} будут удалены безвозвратно.`,
    'danger',
  );
  if (!ok) return;
  await apiClient.post('/rooms/bulk-delete', { ids: selectedRoomIds.value });
  adminRooms.items = adminRooms.items.filter((r) => !selectedRoomIds.value.includes(r.id));
  selectedRoomIds.value = [];
}

async function loadRooms() {
  adminRooms.loading = true;
  try {
    const { data } = await apiClient.get<Room[]>('/rooms');
    adminRooms.items = Array.isArray(data) ? data : [];
    selectedRoomIds.value = [];
  } catch (e) {
    console.error('loadRooms error:', e);
  } finally {
    adminRooms.loading = false;
  }
}

// ── Helpers ──
function userDisplayName(u: UserSummary): string {
  if (u.firstName && u.lastName) return `${u.firstName} ${u.lastName}`;
  if (u.firstName) return u.firstName;
  return u.name;
}

function userInitials(u: UserSummary): string {
  const f = u.firstName?.charAt(0)?.toUpperCase() ?? '';
  const l = u.lastName?.charAt(0)?.toUpperCase() ?? '';
  return (f || l) ? `${f}${l}` : u.name.charAt(0).toUpperCase();
}

function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 19) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

onMounted(() => {
  if (!authStore.isAdmin) {
    router.push('/home');
    return;
  }
  loadUsers();
});
</script>

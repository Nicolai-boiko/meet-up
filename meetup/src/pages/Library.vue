<template>
  <div class="flex h-full -mx-6 -my-6 bg-white overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-72 border-r border-gray-200 flex flex-col bg-gray-50 shrink-0">
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-800">Библиотека</h2>
          <button
            v-if="authStore.isAdmin"
            @click="openCreate"
            class="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
            title="Добавить материал"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
            </svg>
          </button>
        </div>
        <input
          v-model="search"
          type="text"
          placeholder="Поиск..."
          class="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <div class="flex-1 overflow-y-auto">
        <div v-if="contentStore.loading" class="p-4 text-center text-gray-500 text-sm">
          Загрузка...
        </div>
        <div
          v-for="item in filteredItems"
          :key="item.id"
          @click="selectItem(item)"
          class="px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
          :class="{ 'bg-blue-50 border-l-4 border-l-blue-500': contentStore.current?.id === item.id }"
        >
          <div class="flex items-center gap-2">
            <span class="text-lg">
              {{ item.type === 'video' ? '🎬' : item.type === 'link' ? '🔗' : '📄' }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-gray-800 truncate">{{ item.title }}</div>
              <div class="text-xs text-gray-400 mt-0.5">
                {{ item.author?.name }} · {{ formatDate(item.createdAt) }}
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="!contentStore.loading && filteredItems.length === 0"
          class="p-4 text-center text-gray-400 text-sm"
        >
          {{ search ? 'Ничего не найдено' : 'Нет материалов' }}
        </div>
        <!-- Load more -->
        <div v-if="contentStore.hasMore && !search" class="p-3 border-t border-gray-100">
          <button
            @click="loadMore"
            :disabled="contentStore.loadingMore"
            class="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ contentStore.loadingMore ? 'Загрузка...' : `Загрузить ещё (${remainingCount})` }}
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden">
      <!-- Empty selection state -->
      <div
        v-if="!contentStore.current && !isEditing"
        class="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3"
      >
        <svg class="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <span class="text-lg">Выберите материал из списка слева</span>
        <button v-if="authStore.isAdmin" @click="openCreate" class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Создать новый
        </button>
      </div>

      <!-- View Mode -->
      <div v-else-if="!isEditing && contentStore.current" class="flex-1 overflow-y-auto">
        <div class="max-w-3xl mx-auto px-8 py-6">
          <!-- Header -->
          <div class="flex items-start justify-between mb-6">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-2xl">
                  {{ contentStore.current.type === 'video' ? '🎬' : contentStore.current.type === 'link' ? '🔗' : '📄' }}
                </span>
                <h1 class="text-2xl font-bold text-gray-900">{{ contentStore.current.title }}</h1>
              </div>
              <div class="flex items-center gap-3 text-sm text-gray-500">
                <span>{{ contentStore.current.author?.name }}</span>
                <span>·</span>
                <span>{{ formatDate(contentStore.current.createdAt) }}</span>
              </div>
            </div>
            <div v-if="authStore.isAdmin" class="flex gap-2">
              <button
                @click="openEdit"
                class="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Редактировать
              </button>
              <button
                @click="handleDelete"
                class="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>

          <!-- Video embed -->
          <div v-if="contentStore.current.type === 'video' && contentStore.current.mediaUrl" class="mb-6">
            <div class="relative w-full" style="padding-bottom: 56.25%">
              <iframe
                :src="embedUrl"
                class="absolute inset-0 w-full h-full rounded-lg"
                frameborder="0"
                allowfullscreen
              ></iframe>
            </div>
          </div>

          <!-- Body -->
          <div v-if="contentStore.current.body" class="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {{ contentStore.current.body }}
          </div>
          <div v-else class="text-gray-400 italic">Нет содержимого</div>
        </div>
      </div>

      <!-- Edit / Create Mode -->
      <div v-if="isEditing" class="flex-1 overflow-y-auto">
        <div class="max-w-3xl mx-auto px-8 py-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">
            {{ editingId ? 'Редактирование' : 'Новый материал' }}
          </h2>
          <form @submit.prevent="handleSave" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Название</label>
              <input
                v-model="form.title"
                type="text"
                required
                class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Тип</label>
              <select
                v-model="form.type"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="text">Текст</option>
                <option value="video">Видео</option>
                <option value="link">Ссылка</option>
              </select>
            </div>
            <div v-if="form.type === 'video' || form.type === 'link'">
              <label class="block text-sm font-medium text-gray-600 mb-1">URL</label>
              <input
                v-model="form.mediaUrl"
                type="url"
                placeholder="https://..."
                class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Содержимое</label>
              <textarea
                v-model="form.body"
                rows="12"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                placeholder="Текст материала..."
              ></textarea>
            </div>
            <div v-if="saveError" class="text-red-500 text-sm">{{ saveError }}</div>
            <div class="flex gap-3">
              <button
                type="submit"
                :disabled="saving"
                class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {{ saving ? 'Сохранение...' : 'Сохранить' }}
              </button>
              <button
                type="button"
                @click="cancelEdit"
                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useContentStore } from '../stores/content';
import { useAuthStore } from '../stores/auth';
import { useConfirm } from '../composables/useConfirm';

const contentStore = useContentStore();
const authStore = useAuthStore();
const { confirm } = useConfirm();
const search = ref('');
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);
const saveError = ref<string | null>(null);

const form = reactive({ title: '', type: 'text', body: '', mediaUrl: '' });

const filteredItems = computed(() => {
  const q = search.value.toLowerCase();
  if (!q) return contentStore.items;
  return contentStore.items.filter(
    (i) =>
      i.title.toLowerCase().includes(q) ||
      (i.body && i.body.toLowerCase().includes(q)),
  );
});

const embedUrl = computed(() => {
  const url = contentStore.current?.mediaUrl;
  if (!url) return '';
  // Convert youtube watch links to embed
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  return url;
});

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

async function selectItem(item: typeof contentStore.current) {
  if (!item) return;
  isEditing.value = false;
  editingId.value = null;
  contentStore.current = item;
}

function openCreate() {
  editingId.value = null;
  form.title = '';
  form.type = 'text';
  form.body = '';
  form.mediaUrl = '';
  saveError.value = null;
  isEditing.value = true;
}

function openEdit() {
  const c = contentStore.current;
  if (!c) return;
  editingId.value = c.id;
  form.title = c.title;
  form.type = c.type;
  form.body = c.body ?? '';
  form.mediaUrl = c.mediaUrl ?? '';
  saveError.value = null;
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  editingId.value = null;
  if (!contentStore.current && contentStore.items.length > 0) {
    const first = contentStore.items[0];
    if (first) contentStore.current = first;
  }
}

async function handleSave() {
  saving.value = true;
  saveError.value = null;
  try {
    if (editingId.value) {
      await contentStore.update(editingId.value, {
        title: form.title,
        type: form.type,
        body: form.body || null,
        mediaUrl: form.mediaUrl || null,
      });
    } else {
      await contentStore.create({
        title: form.title,
        type: form.type,
        body: form.body || null,
        mediaUrl: form.mediaUrl || null,
      });
    }
    isEditing.value = false;
    editingId.value = null;
  } catch (e: any) {
    saveError.value = e.response?.data?.message || 'Ошибка сохранения';
  } finally {
    saving.value = false;
  }
}

async function handleDelete() {
  if (!contentStore.current) return;
  const ok = await confirm('Удалить материал?', `«${contentStore.current.title}» будет удалён безвозвратно.`, 'danger');
  if (!ok) return;
  try {
    await contentStore.remove(contentStore.current.id);
  } catch (e) {
    console.error('Delete error:', e);
  }
}

const remainingCount = computed(() =>
  Math.max(0, contentStore.total - contentStore.items.length),
);

function loadMore() {
  contentStore.fetchMore();
}

onMounted(() => {
  contentStore.fetchPage(1);
});
</script>

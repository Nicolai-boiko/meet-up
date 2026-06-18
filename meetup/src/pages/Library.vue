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
        <div class="flex gap-2 mt-0">
          <input
            v-model="search"
            type="text"
            placeholder="Поиск..."
            class="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            @click="showFavorites = !showFavorites; fetchFiltered()"
            class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            :class="showFavorites ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'"
            title="Избранное"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        </div>
        <!-- Sort -->
        <div class="mt-2">
          <select
            v-model="sortBy"
            class="w-full border rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-600"
          >
            <option value="createdAt_desc">По дате (новые)</option>
            <option value="createdAt_asc">По дате (старые)</option>
            <option value="title_asc">По названию (А-Я)</option>
            <option value="title_desc">По названию (Я-А)</option>
            <option value="type_asc">По типу</option>
          </select>
        </div>
        <!-- Tag filter chips -->
        <div v-if="allTags.length" class="flex flex-wrap gap-1 mt-2">
          <button
            v-for="tag in allTags"
            :key="tag.id"
            @click="toggleTagFilter(tag.id)"
            class="px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors"
            :class="selectedTagIds.includes(tag.id)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'"
          >
            {{ tag.name }}
          </button>
        </div>
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
              {{ item.type === 'video' ? '🎬' : item.type === 'link' ? '🔗' : item.type === 'file' ? '📁' : '📄' }}
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <div class="text-sm font-medium text-gray-800 truncate">{{ item.title }}</div>
                <button
                  v-if="authStore.isAuthenticated"
                  @click.stop="handleToggleFavorite(item)"
                  class="shrink-0"
                  :class="item.isFavorited ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'"
                  title="В избранное"
                >
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              </div>
              <div class="text-xs text-gray-400 mt-0.5">
                {{ item.author?.name }} · {{ formatDate(item.createdAt) }}
              </div>
              <div v-if="item.tags?.length" class="flex flex-wrap gap-1 mt-1">
                <span
                  v-for="tag in item.tags"
                  :key="tag.id"
                  class="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700"
                >
                  {{ tag.name }}
                </span>
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
                  {{ contentStore.current.type === 'video' ? '🎬' : contentStore.current.type === 'link' ? '🔗' : contentStore.current.type === 'file' ? '📁' : '📄' }}
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

          <!-- Files list -->
          <div v-if="contentStore.current.files?.length" class="mb-6">
            <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Файлы</h3>
            <div class="space-y-2">
              <div
                v-for="f in contentStore.current.files"
                :key="f.id"
                class="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <a
                  :href="`http://localhost:3000${f.filePath}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  :download="f.fileName"
                  class="flex items-center gap-2 text-blue-700 hover:text-blue-900 min-w-0"
                >
                  <svg class="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm font-medium truncate">{{ f.fileName }}</span>
                  <span v-if="f.fileSize" class="text-xs text-blue-400 shrink-0">{{ formatFileSize(f.fileSize) }}</span>
                </a>
                <button
                  v-if="authStore.isAdmin"
                  @click="handleDeleteFile(f.id)"
                  class="ml-2 text-red-400 hover:text-red-600 shrink-0"
                  title="Удалить файл"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <!-- Single file fallback (backward compat) -->
          <div v-else-if="contentStore.current.type === 'file' && contentStore.current.mediaUrl && !contentStore.current.files?.length" class="mb-6">
            <a
              :href="fileDownloadUrl"
              target="_blank"
              rel="noopener noreferrer"
              :download="contentStore.current.fileName || 'file'"
              class="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <span class="text-sm font-medium">{{ contentStore.current.fileName || 'Скачать файл' }}</span>
            </a>
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
                <option value="file">Файл</option>
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
            <div v-if="form.type === 'file'">
              <label class="block text-sm font-medium text-gray-600 mb-1">Файл</label>
              <input
                ref="fileInput"
                type="file"
                @change="onFileSelected"
                class="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div v-if="selectedFile" class="text-xs text-gray-500 mt-1">{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</div>
              <div v-else-if="editingId && form.mediaUrl" class="text-xs text-gray-500 mt-1">Текущий файл: {{ form.fileName || 'загружен' }} (новый не выбран)</div>
            </div>
            <!-- Files section (create + edit) -->
            <div>
              <!-- Edit mode: already saved files -->
              <div v-if="editingId && editingFiles.length" class="space-y-1">
                <label class="block text-sm font-medium text-gray-600 mb-1">Файлы записи</label>
                <div
                  v-for="f in editingFiles"
                  :key="f.id"
                  class="flex items-center justify-between px-3 py-2 bg-gray-50 border rounded-lg"
                >
                  <span class="text-sm text-gray-700 truncate">{{ f.fileName }}</span>
                  <button
                    type="button"
                    @click="handleDeleteFile(f.id)"
                    class="ml-2 text-red-400 hover:text-red-600 shrink-0"
                    title="Удалить"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <!-- Create mode: pending files (not yet uploaded) -->
              <div v-if="!editingId && pendingCreateFiles.length" class="space-y-1">
                <label class="block text-sm font-medium text-gray-600 mb-1">Файлы для загрузки</label>
                <div
                  v-for="(f, idx) in pendingCreateFiles"
                  :key="idx"
                  class="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <span class="text-sm text-gray-700 truncate">{{ f.name }}</span>
                  <span class="text-xs text-gray-400 shrink-0 mx-2">{{ formatFileSize(f.size) }}</span>
                  <button
                    type="button"
                    @click="pendingCreateFiles.splice(idx, 1)"
                    class="ml-2 text-red-400 hover:text-red-600 shrink-0"
                    title="Убрать"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <!-- Edit mode: pending new files (sent on save) -->
              <div v-if="editingId && pendingEditFiles.length" class="space-y-1 mt-2">
                <label class="block text-sm font-medium text-gray-600 mb-1">Новые файлы (будут загружены при сохранении)</label>
                <div
                  v-for="(f, idx) in pendingEditFiles"
                  :key="idx"
                  class="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <span class="text-sm text-gray-700 truncate">{{ f.name }}</span>
                  <span class="text-xs text-gray-400 shrink-0 mx-2">{{ formatFileSize(f.size) }}</span>
                  <button
                    type="button"
                    @click="pendingEditFiles.splice(idx, 1)"
                    class="ml-2 text-red-400 hover:text-red-600 shrink-0"
                    title="Убрать"
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <!-- Edit mode: add files (collected locally, sent on save) -->
              <div v-if="editingId" class="mt-2">
                <label class="block text-sm font-medium text-gray-600 mb-1">Добавить файлы</label>
                <input
                  type="file"
                  multiple
                  @change="onPendingEditFilesSelected"
                  class="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <!-- Create mode: select files (sent on save) -->
              <div v-if="!editingId" class="mt-2">
                <label class="block text-sm font-medium text-gray-600 mb-1">Добавить файлы</label>
                <input
                  type="file"
                  multiple
                  @change="onPendingFilesSelected"
                  class="w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">Теги</label>
              <div class="flex flex-wrap gap-1.5 p-2 border rounded-lg min-h-[38px] bg-white items-center">
                <span
                  v-for="tag in allTags"
                  :key="tag.id"
                  @click="toggleFormTag(tag.id)"
                  class="px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors"
                  :class="formTagIds.includes(tag.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                >
                  {{ tag.name }}
                </span>
                <span v-if="allTags.length === 0" class="text-xs text-gray-400">Нет тегов</span>
                <!-- Inline new tag input (admin only) -->
                <div v-if="authStore.isAdmin" class="flex gap-1 items-center">
                  <input
                    v-model="newTagName"
                    type="text"
                    placeholder="Новый тег"
                    class="w-20 px-1.5 py-0.5 text-xs border rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                    @keydown.enter.prevent="createAndAddTag"
                  />
                  <button
                    v-if="newTagName.trim()"
                    type="button"
                    @click="createAndAddTag"
                    class="w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] hover:bg-green-600"
                  >
                    +
                  </button>
                </div>
              </div>
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
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useContentStore } from '../stores/content';
import { useAuthStore } from '../stores/auth';
import { useConfirm } from '../composables/useConfirm';
import apiClient from '../api';
import type { ContentFile, ContentItem, Tag } from '../types';

const contentStore = useContentStore();
const authStore = useAuthStore();
const { confirm } = useConfirm();
const search = ref('');
const showFavorites = ref(false);
const sortBy = ref('createdAt_desc');
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const saving = ref(false);
const saveError = ref<string | null>(null);

const form = reactive({ title: '', type: 'text', body: '', mediaUrl: '', fileName: '' as string | null });
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const pendingCreateFiles = ref<File[]>([]);
const pendingEditFiles = ref<File[]>([]);

const editingFiles = computed<ContentFile[]>(() => {
  return contentStore.current?.files ?? [];
});

function onFileSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  selectedFile.value = input.files?.[0] ?? null;
}

function onPendingFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    for (let i = 0; i < input.files.length; i++) {
      const f = input.files[i];
      if (f) pendingCreateFiles.value.push(f);
    }
    input.value = '';
  }
}

function onPendingEditFilesSelected(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files) {
    for (let i = 0; i < input.files.length; i++) {
      const f = input.files[i];
      if (f) pendingEditFiles.value.push(f);
    }
    input.value = '';
  }
}

async function handleDeleteFile(fileId: number) {
  if (!editingId.value && !contentStore.current) return;
  const contentId = editingId.value ?? contentStore.current!.id;
  try {
    await contentStore.deleteFile(contentId, fileId);
  } catch (e) {
    console.error('handleDeleteFile error:', e);
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

const fileDownloadUrl = computed(() => {
  const url = contentStore.current?.mediaUrl;
  if (!url) return '';
  return `http://localhost:3000${url}`;
});

// ── Tags ──
const allTags = ref<Tag[]>([]);
const selectedTagIds = ref<number[]>([]);
const formTagIds = ref<number[]>([]);

watch(sortBy, (val) => {
  const parts = val.split('_');
  contentStore.sortBy = parts[0] ?? 'createdAt';
  contentStore.sortOrder = parts[1] ?? 'desc';
  fetchFiltered();
});

function fetchFiltered() {
  const activeTag = selectedTagIds.value[0];
  contentStore.fetchPage(1, activeTag, showFavorites.value);
}

function toggleTagFilter(tagId: number) {
  const idx = selectedTagIds.value.indexOf(tagId);
  if (idx >= 0) {
    selectedTagIds.value = selectedTagIds.value.filter((id) => id !== tagId);
  } else {
    // Один тег за раз для фильтрации
    selectedTagIds.value = [tagId];
  }
  fetchFiltered();
}

async function handleToggleFavorite(item: ContentItem) {
  try {
    await contentStore.toggleFavorite(item.id);
  } catch (e) {
    console.error('toggleFavorite error:', e);
  }
}

function toggleFormTag(tagId: number) {
  const idx = formTagIds.value.indexOf(tagId);
  if (idx >= 0) {
    formTagIds.value = formTagIds.value.filter((id) => id !== tagId);
  } else {
    formTagIds.value = [...formTagIds.value, tagId];
  }
}

const newTagName = ref('');

async function loadTags() {
  try {
    const { data } = await apiClient.get<Tag[]>('/tags');
    allTags.value = data;
  } catch (e) {
    console.error('loadTags error:', e);
  }
}

async function createAndAddTag() {
  const name = newTagName.value.trim();
  if (!name) return;
  try {
    const { data: tag } = await apiClient.post<Tag>('/tags', { name });
    allTags.value.push(tag);
    formTagIds.value.push(tag.id);
    newTagName.value = '';
  } catch (e: any) {
    console.error('createAndAddTag error:', e);
  }
}

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
  form.fileName = null;
  selectedFile.value = null;
  pendingCreateFiles.value = [];
  if (fileInput.value) fileInput.value.value = '';
  formTagIds.value = [];
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
  form.fileName = c.fileName ?? null;
  selectedFile.value = null;
  pendingEditFiles.value = [];
  if (fileInput.value) fileInput.value.value = '';
  formTagIds.value = (c.tags ?? []).map((t) => t.id);
  saveError.value = null;
  isEditing.value = true;
}

function cancelEdit() {
  isEditing.value = false;
  editingId.value = null;
  pendingCreateFiles.value = [];
  pendingEditFiles.value = [];
  if (!contentStore.current && contentStore.items.length > 0) {
    const first = contentStore.items[0];
    if (first) contentStore.current = first;
  }
}

async function handleSave() {
  saving.value = true;
  saveError.value = null;
  try {
    const file = selectedFile.value ?? null;
    if (editingId.value) {
      await contentStore.update(editingId.value, {
        title: form.title,
        type: form.type,
        body: form.body || null,
        mediaUrl: form.mediaUrl || null,
        tagIds: formTagIds.value,
        file,
        files: pendingEditFiles.value.length ? [...pendingEditFiles.value] : undefined,
      });
      pendingEditFiles.value = [];
    } else {
      await contentStore.create({
        title: form.title,
        type: form.type,
        body: form.body || null,
        mediaUrl: form.mediaUrl || null,
        tagIds: formTagIds.value,
        file,
        files: pendingCreateFiles.value.length ? [...pendingCreateFiles.value] : undefined,
      });
      pendingCreateFiles.value = [];
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
  const activeTag = selectedTagIds.value[0];
  contentStore.fetchMore(activeTag);
}

onMounted(() => {
  fetchFiltered();
  loadTags();
});
</script>

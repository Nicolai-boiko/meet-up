<template>
  <div class="h-full -mx-6 -my-6 flex flex-col overflow-auto">
    <!-- Hero -->
    <section class="flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 py-16 max-w-5xl mx-auto">
      <div class="flex-1 text-center lg:text-left">
        <h1 class="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
          Встречи, знания,<br />
          <span class="text-blue-600">коммуникация</span>
        </h1>
        <p class="mt-6 text-lg text-gray-500 max-w-lg leading-relaxed">
          Платформа для видео-конференций, обмена полезными материалами и организации встреч.
          Создавайте комнаты для созвонов, делитесь знаниями в библиотеке и планируйте митапы.
        </p>
        <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <router-link
            v-if="authStore.isAuthenticated"
            to="/create-call"
            class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Создать звонок
          </router-link>
          <router-link
            v-else
            to="/auth"
            class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Начать сейчас
          </router-link>
          <router-link
            to="/library"
            class="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors"
          >
            Библиотека
          </router-link>
        </div>
      </div>
      <!-- Illustration -->
      <div class="flex-1 max-w-md">
        <svg viewBox="0 0 400 300" class="w-full h-auto" fill="none">
          <!-- Background circles -->
          <circle cx="120" cy="140" r="90" class="fill-blue-50" />
          <circle cx="280" cy="100" r="60" class="fill-blue-100" opacity="0.5" />
          <circle cx="310" cy="230" r="40" class="fill-blue-50" />
          <!-- Desk/laptop -->
          <rect x="70" y="110" width="160" height="105" rx="6" class="fill-gray-200" />
          <rect x="80" y="120" width="140" height="82" rx="4" class="fill-white" />
          <rect x="110" y="145" width="80" height="2" rx="1" class="fill-gray-300" />
          <rect x="110" y="155" width="50" height="2" rx="1" class="fill-gray-300" />
          <rect x="110" y="165" width="60" height="2" rx="1" class="fill-gray-300" />
          <rect x="60" y="215" width="180" height="8" rx="2" class="fill-gray-300" />
          <rect x="90" y="223" width="120" height="4" rx="2" class="fill-gray-200" />
          <!-- Person 1 (left, facing right) -->
          <circle cx="190" cy="70" r="18" class="fill-blue-400" />
          <path d="M160 120c0-16 13-30 30-30s30 14 30 30" class="fill-blue-400" />
          <!-- Person 2 (right side, smaller, video call style) -->
          <rect x="240" y="60" width="90" height="65" rx="8" class="fill-green-100 stroke-green-300" stroke-width="1.5" />
          <circle cx="275" cy="85" r="10" class="fill-green-400" />
          <path d="M260 115c0-8 7-15 15-15s15 7 15 15" class="fill-green-400" />
          <!-- Connection dots -->
          <circle cx="210" cy="50" r="4" class="fill-blue-400" />
          <circle cx="230" cy="55" r="3" class="fill-blue-300" />
          <circle cx="195" cy="65" r="3" class="fill-blue-300" />
          <!-- Person 3 (small, bottom) -->
          <rect x="280" y="170" width="80" height="55" rx="7" class="fill-purple-100 stroke-purple-300" stroke-width="1.5" />
          <circle cx="310" cy="190" r="9" class="fill-purple-400" />
          <path d="M296 218c0-7 6-13 14-13s14 6 14 13" class="fill-purple-400" />
        </svg>
      </div>
    </section>

    <!-- Feature cards -->
    <section class="bg-gray-50 border-t border-gray-200 px-6 py-12">
      <div class="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        <router-link to="/create-call" class="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer block">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-800 mb-2">Видео-звонки</h3>
          <p class="text-sm text-gray-500">Создавайте комнаты и общайтесь с участниками в реальном времени.</p>
        </router-link>
        <router-link to="/library" class="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer block">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-800 mb-2">Библиотека знаний</h3>
          <p class="text-sm text-gray-500">Храните и делитесь полезными материалами, статьями и видео.</p>
        </router-link>
        <router-link to="/schedule" class="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer block">
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="font-semibold text-gray-800 mb-2">Расписание</h3>
          <p class="text-sm text-gray-500">Планируйте встречи и митапы с удобным календарём.</p>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
</script>

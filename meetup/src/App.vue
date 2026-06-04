<template>
  <div id="app" class="bg-gray-100 h-screen flex flex-col overflow-hidden">
    <header class="bg-blue-600 text-white shadow-md shrink-0">
      <nav class="container mx-auto px-6 py-3 flex justify-between items-center">
        <div class="flex items-center gap-1">
          <router-link to="/home" class="text-xl font-bold px-2 hover:text-blue-200 transition-colors">
            MeetUp
          </router-link>
          <template v-if="authStore.isAuthenticated">
            <router-link
              to="/create-call"
              class="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-blue-700 transition-colors"
              active-class="bg-blue-700 text-white"
            >
              Звонки
            </router-link>
            <router-link
              to="/library"
              class="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-blue-700 transition-colors"
              active-class="bg-blue-700 text-white"
            >
              Библиотека
            </router-link>
            <router-link
              to="/schedule"
              class="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-blue-700 transition-colors"
              active-class="bg-blue-700 text-white"
            >
              Расписание
            </router-link>
          </template>
        </div>
        <div class="flex items-center gap-4">
          <template v-if="!authStore.isAuthenticated">
            <router-link to="/auth" class="px-4 py-2 rounded-md text-white hover:bg-blue-700">
              Вход / Регистрация
            </router-link>
          </template>
          <template v-else>
            <router-link
              to="/profile"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <div
                v-if="authStore.profile?.avatar"
                class="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30"
              >
                <img
                  :src="authStore.profile.avatar"
                  alt="Аватар"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-400 text-white border-2 border-white/30"
              >
                {{ authStore.initials }}
              </div>
              <span class="text-sm hidden sm:inline">{{ authStore.displayName }}</span>
            </router-link>
            <button @click="handleLogout" class="px-4 py-2 rounded-md text-white hover:bg-blue-700">
              Выйти
            </button>
          </template>
        </div>
      </nav>
    </header>
    <main class="container mx-auto p-6 flex-1 min-h-0 overflow-auto">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/auth');
};
</script>

<style>
/* Global styles can be added here if needed, but Tailwind is preferred. */
</style>

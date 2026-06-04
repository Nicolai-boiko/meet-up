<template>
  <div id="app" class="bg-gray-100 min-h-screen">
    <header class="bg-blue-600 text-white shadow-md">
      <nav class="container mx-auto px-6 py-3 flex justify-between items-center">
        <router-link to="/home" class="text-2xl font-bold">Meetups</router-link>
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
    <main class="container mx-auto p-6">
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

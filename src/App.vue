<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-blue-600 focus:rounded-lg focus:shadow-lg"
    >Перейти к содержимому</a
  >
  <div id="app" class="bg-gray-100 dark:bg-gray-950 h-screen flex flex-col overflow-hidden">
    <header class="bg-blue-600 dark:bg-blue-900 text-white shadow-md shrink-0">
      <nav
        class="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center"
        aria-label="Главная навигация"
      >
        <div class="flex items-center gap-1">
          <router-link
            to="/home"
            class="text-xl font-bold px-2 hover:text-blue-200 transition-colors"
            >MeetUp</router-link
          >
          <template v-if="authStore.isAuthenticated">
            <div class="hidden md:flex items-center gap-1">
              <router-link
                to="/create-call"
                class="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                active-class="bg-blue-700 dark:bg-blue-800 text-white"
                >{{ $t('nav.calls') }}</router-link
              >
              <router-link
                to="/library"
                class="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                active-class="bg-blue-700 dark:bg-blue-800 text-white"
                >{{ $t('nav.library') }}</router-link
              >
              <router-link
                to="/schedule"
                class="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                active-class="bg-blue-700 dark:bg-blue-800 text-white"
                >{{ $t('nav.schedule') }}</router-link
              >
              <router-link
                v-if="authStore.isAdmin"
                to="/admin"
                class="px-3 py-2 rounded-lg text-sm font-medium text-yellow-300 hover:text-white hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                active-class="bg-blue-700 dark:bg-blue-800 text-white"
                >{{ $t('nav.admin') }}</router-link
              >
            </div>
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="md:hidden p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800"
              aria-label="Меню"
              :aria-expanded="mobileMenuOpen"
            >
              <svg v-if="!mobileMenuOpen" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </template>
        </div>
        <!-- Mobile menu dropdown -->
        <div
          v-if="mobileMenuOpen && authStore.isAuthenticated"
          class="absolute top-14 left-0 right-0 bg-blue-700 dark:bg-blue-950 md:hidden z-40 shadow-lg"
        >
          <router-link
            to="/create-call"
            @click="mobileMenuOpen = false"
            class="block px-6 py-3 text-sm font-medium hover:bg-blue-800"
            >{{ $t('nav.calls') }}</router-link
          >
          <router-link
            to="/library"
            @click="mobileMenuOpen = false"
            class="block px-6 py-3 text-sm font-medium hover:bg-blue-800"
            >{{ $t('nav.library') }}</router-link
          >
          <router-link
            to="/schedule"
            @click="mobileMenuOpen = false"
            class="block px-6 py-3 text-sm font-medium hover:bg-blue-800"
            >{{ $t('nav.schedule') }}</router-link
          >
          <router-link
            v-if="authStore.isAdmin"
            to="/admin"
            @click="mobileMenuOpen = false"
            class="block px-6 py-3 text-sm font-medium text-yellow-300 hover:bg-blue-800"
            >{{ $t('nav.admin') }}</router-link
          >
        </div>
        <div class="flex items-center gap-2 sm:gap-4">
          <button
            @click="theme.toggle()"
            class="p-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            :aria-label="theme.theme.value === 'dark' ? 'Светлая тема' : 'Тёмная тема'"
          >
            <svg
              v-if="theme.theme.value === 'light'"
              class="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clip-rule="evenodd"
              />
            </svg>
            <svg v-else class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </button>
          <select
            v-model="currentLocale"
            @change="setLocale(currentLocale)"
            class="bg-blue-700 dark:bg-blue-800 text-white text-xs rounded px-2 py-1 border border-blue-500 focus:outline-none"
          >
            <option value="ru">RU</option>
            <option value="en">EN</option>
          </select>
          <template v-if="!authStore.isAuthenticated">
            <router-link
              to="/auth"
              class="px-4 py-2 rounded-md text-white hover:bg-blue-700 dark:hover:bg-blue-800"
              >{{ $t('nav.login') }}</router-link
            >
          </template>
          <template v-else>
            <router-link
              to="/profile"
              class="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
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
            <button
              @click="handleLogout"
              class="px-4 py-2 rounded-md text-white hover:bg-blue-700 dark:hover:bg-blue-800"
            >
              {{ $t('nav.logout') }}
            </button>
          </template>
        </div>
      </nav>
    </header>
    <main id="main-content" class="container mx-auto p-6 flex-1 min-h-0 overflow-auto">
      <router-view></router-view>
    </main>

    <ConfirmModal ref="confirmModalRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from './stores/auth'
import ConfirmModal from './components/ConfirmModal.vue'
import { registerConfirmModal } from './composables/useConfirm'
import { useTheme } from './composables/useTheme'
import { setLocale } from './plugins/i18n'

const { locale: currentLocale } = useI18n()
const theme = useTheme()

const confirmModalRef = ref<InstanceType<typeof ConfirmModal> | null>(null)

onMounted(() => {
  if (confirmModalRef.value) {
    registerConfirmModal(confirmModalRef.value)
  }
})

const authStore = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

const handleLogout = () => {
  authStore.logout()
  router.push('/auth')
}
</script>

<style>
/* Global styles can be added here if needed, but Tailwind is preferred. */
</style>

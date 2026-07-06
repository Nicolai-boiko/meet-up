<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-950 py-8 transition-colors">
    <div class="max-w-2xl mx-auto px-4 space-y-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white">{{ $t('profile.title') }}</h1>
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
        <div class="flex flex-col sm:flex-row items-center gap-5">
          <div class="relative group">
            <div
              v-if="authStore.profile?.avatar"
              class="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-200 dark:border-gray-600"
            >
              <img
                :src="authStore.profile.avatar"
                alt="Аватар"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-else
              class="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white border-4 border-gray-200 dark:border-gray-600"
              :style="{ backgroundColor: avatarColor }"
            >
              {{ authStore.initials }}
            </div>
            <label
              class="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
            >
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                />
              </svg>
              <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
            </label>
          </div>
          <div class="text-center sm:text-left">
            <h2 class="text-xl font-semibold text-gray-800 dark:text-white">
              {{ authStore.displayName }}
            </h2>
            <p class="text-gray-500 dark:text-white text-sm">{{ authStore.profile?.email }}</p>
            <button
              v-if="authStore.profile?.avatar"
              @click="removeAvatar"
              class="text-red-500 text-sm hover:underline mt-1"
            >
              {{ $t('profile.removeAvatar') }}
            </button>
          </div>
        </div>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {{ $t('profile.personalData') }}
        </h3>
        <form @submit.prevent="handleUpdateProfile" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-white mb-1">{{
                $t('profile.username')
              }}</label
              ><input
                v-model="form.name"
                type="text"
                class="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-white mb-1"
                >Email</label
              ><input
                :value="authStore.profile?.email"
                type="email"
                class="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-white mb-1">{{
                $t('profile.firstName')
              }}</label
              ><input
                v-model="form.firstName"
                type="text"
                class="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-white mb-1">{{
                $t('profile.lastName')
              }}</label
              ><input
                v-model="form.lastName"
                type="text"
                class="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-white mb-1">{{
                $t('profile.birthDate')
              }}</label
              ><input
                v-model="form.birthDate"
                type="date"
                class="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div v-if="profileError" class="text-red-500 text-sm">{{ profileError }}</div>
          <div v-if="profileSuccess" class="text-green-500 text-sm">{{ profileSuccess }}</div>
          <button
            type="submit"
            :disabled="saving"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {{ saving ? $t('profile.saving') : $t('profile.save') }}
          </button>
        </form>
      </div>
      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {{ $t('profile.changePassword') }}
        </h3>
        <form @submit.prevent="handleChangePassword" class="space-y-4 max-w-md">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-white mb-1">{{
              $t('profile.currentPassword')
            }}</label
            ><input
              v-model="passwordForm.current"
              type="password"
              class="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-white mb-1">{{
              $t('profile.newPassword')
            }}</label
            ><input
              v-model="passwordForm.new"
              type="password"
              class="w-full border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              minlength="6"
            />
          </div>
          <div v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="text-green-500 text-sm">{{ passwordSuccess }}</div>
          <button
            type="submit"
            :disabled="changingPassword"
            class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {{ changingPassword ? $t('profile.changing') : $t('profile.changePassword') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const saving = ref(false)
const profileError = ref<string | null>(null)
const profileSuccess = ref<string | null>(null)

const form = reactive({
  name: '',
  firstName: '',
  lastName: '',
  birthDate: '',
})

const passwordForm = reactive({ current: '', new: '' })
const changingPassword = ref(false)
const passwordError = ref<string | null>(null)
const passwordSuccess = ref<string | null>(null)

const avatarColor = computed(() => {
  const colors = [
    '#4F46E5',
    '#7C3AED',
    '#DB2777',
    '#DC2626',
    '#EA580C',
    '#CA8A04',
    '#16A34A',
    '#0891B2',
    '#2563EB',
    '#9333EA',
  ]
  const id = authStore.profile?.id ?? 0
  return colors[id % colors.length]
})

function initForm() {
  const p = authStore.profile
  if (p) {
    form.name = p.name
    form.firstName = p.firstName ?? ''
    form.lastName = p.lastName ?? ''
    form.birthDate = p.birthDate ? (p.birthDate.split('T')[0] ?? '') : ''
  }
}

async function handleUpdateProfile() {
  saving.value = true
  profileError.value = null
  profileSuccess.value = null
  try {
    await authStore.updateProfile({
      firstName: form.firstName || null,
      lastName: form.lastName || null,
      birthDate: form.birthDate || null,
    })
    profileSuccess.value = 'Профиль обновлён'
    setTimeout(() => {
      profileSuccess.value = null
    }, 3000)
  } catch (e: unknown) {
    profileError.value =
      (e as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}

async function handleChangePassword() {
  changingPassword.value = true
  passwordError.value = null
  passwordSuccess.value = null
  try {
    await authStore.changePassword(passwordForm.current, passwordForm.new)
    passwordSuccess.value = 'Пароль изменён'
    passwordForm.current = ''
    passwordForm.new = ''
    setTimeout(() => {
      passwordSuccess.value = null
    }, 3000)
  } catch (e: unknown) {
    passwordError.value =
      (e as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Ошибка смены пароля'
  } finally {
    changingPassword.value = false
  }
}

async function handleAvatarUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    profileError.value = 'Файл слишком большой (макс. 2MB)'
    return
  }
  try {
    await authStore.uploadAvatar(file)
  } catch (e: unknown) {
    profileError.value =
      (e as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Ошибка загрузки аватара'
  }
}

async function removeAvatar() {
  await authStore.updateProfile({ avatar: null })
}

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push('/auth')
    return
  }
  if (!authStore.profile) {
    authStore.fetchProfile().then(() => initForm())
  } else {
    initForm()
  }
})
</script>

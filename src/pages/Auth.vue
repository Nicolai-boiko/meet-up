<template>
  <div
    class="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col justify-center sm:py-12 transition-colors"
  >
    <div class="p-10 xs:p-0 mx-auto w-full max-w-md">
      <div
        class="bg-white dark:bg-gray-900 shadow w-full rounded-lg divide-y divide-gray-200 dark:divide-gray-700 min-w-80"
      >
        <div v-if="authMode !== 'forgotPassword'" class="p-5">
          <div class="flex justify-around">
            <button
              @click="switchMode('login')"
              :class="
                authMode === 'login'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
              "
              class="px-4 py-2 font-bold rounded-md"
            >
              {{ $t('auth.login') }}
            </button>
            <button
              @click="switchMode('register')"
              :class="
                authMode === 'register'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
              "
              class="px-4 py-2 font-bold rounded-md"
            >
              {{ $t('auth.register') }}
            </button>
          </div>
        </div>
        <div v-if="authMode === 'login'" class="px-5 py-7">
          <form @submit.prevent="handleLogin">
            <label class="font-semibold text-sm text-gray-600 dark:text-white pb-1 block">{{
              $t('auth.email')
            }}</label>
            <input
              v-model="email"
              type="email"
              class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required
            />
            <label class="font-semibold text-sm text-gray-600 dark:text-white pb-1 block">{{
              $t('auth.password')
            }}</label>
            <input
              v-model="password"
              type="password"
              class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required
            />
            <div v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</div>
            <button
              type="submit"
              class="transition duration-200 bg-blue-500 hover:bg-blue-600 text-white w-full py-2.5 rounded-lg text-sm font-semibold"
            >
              {{ $t('auth.loginBtn') }}
            </button>
          </form>
          <div class="text-center mt-4">
            <a
              href="#"
              @click.prevent="switchMode('forgotPassword')"
              class="text-sm text-blue-500 hover:underline"
              >{{ $t('auth.forgotPassword') }}</a
            >
          </div>
        </div>
        <div v-if="authMode === 'register'" class="px-5 py-7">
          <form @submit.prevent="handleRegister">
            <label class="font-semibold text-sm text-gray-600 dark:text-white pb-1 block">{{
              $t('auth.name')
            }}</label>
            <input
              v-model="name"
              type="text"
              class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required
            />
            <label class="font-semibold text-sm text-gray-600 dark:text-white pb-1 block">{{
              $t('auth.email')
            }}</label>
            <input
              v-model="email"
              type="email"
              class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required
            />
            <label class="font-semibold text-sm text-gray-600 dark:text-white pb-1 block">{{
              $t('auth.password')
            }}</label>
            <input
              v-model="password"
              type="password"
              class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required
            />
            <div v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</div>
            <button
              type="submit"
              class="transition duration-200 bg-blue-500 hover:bg-blue-600 text-white w-full py-2.5 rounded-lg text-sm font-semibold"
            >
              {{ $t('auth.registerBtn') }}
            </button>
          </form>
        </div>
        <div v-if="authMode === 'forgotPassword'" class="px-5 py-7">
          <form @submit.prevent="handleForgotPassword">
            <label class="font-semibold text-sm text-gray-600 dark:text-white pb-1 block">{{
              $t('auth.email')
            }}</label>
            <input
              v-model="email"
              type="email"
              class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required
            />
            <div v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</div>
            <div v-if="message" class="text-green-500 text-sm mb-4">{{ message }}</div>
            <button
              type="submit"
              :disabled="forgotSending"
              class="transition duration-200 bg-blue-500 hover:bg-blue-600 text-white w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {{ forgotSending ? '...' : $t('auth.sendReset') }}
            </button>
          </form>
          <div class="text-center mt-4">
            <a
              href="#"
              @click.prevent="switchMode('login')"
              class="text-sm text-blue-500 hover:underline"
              >{{ $t('auth.hasAccount') }}</a
            >
          </div>
        </div>
        <div v-if="authMode === 'resetPassword'" class="px-5 py-7">
          <div class="text-center mb-4">
            <h3 class="font-semibold text-gray-800 dark:text-white">
              {{ $t('auth.resetPassword') }}
            </h3>
          </div>
          <form @submit.prevent="handleResetPassword">
            <label class="font-semibold text-sm text-gray-600 dark:text-white pb-1 block">{{
              $t('auth.newPassword')
            }}</label>
            <input
              v-model="newPassword"
              type="password"
              class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 mt-1 mb-2 text-sm w-full"
              required
              minlength="6"
            />
            <label class="font-semibold text-sm text-gray-600 dark:text-white pb-1 block">{{
              $t('auth.confirmPassword')
            }}</label>
            <input
              v-model="newPasswordConfirm"
              type="password"
              class="border dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required
              minlength="6"
            />
            <div v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</div>
            <div v-if="message" class="text-green-500 text-sm mb-4">{{ message }}</div>
            <button
              type="submit"
              :disabled="resetSending"
              class="transition duration-200 bg-blue-500 hover:bg-blue-600 text-white w-full py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {{ resetSending ? '...' : $t('auth.resetBtn') }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import apiClient from '../api'

type AuthMode = 'login' | 'register' | 'forgotPassword' | 'resetPassword'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const authMode = ref<AuthMode>('login')
const email = ref('')
const password = ref('')
const name = ref('')
const newPassword = ref('')
const newPasswordConfirm = ref('')
const resetToken = ref('')
const error = ref<string | null>(null)
const message = ref<string | null>(null)
const forgotSending = ref(false)
const resetSending = ref(false)

const switchMode = (mode: AuthMode) => {
  authMode.value = mode
  name.value = ''
  email.value = ''
  password.value = ''
  newPassword.value = ''
  newPasswordConfirm.value = ''
  error.value = null
  message.value = null
}

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Email и пароль обязательны.'
    return
  }
  error.value = null
  try {
    await authStore.login({ email: email.value, password: password.value })
    router.push('/home')
  } catch (err: unknown) {
    console.error('Login Error:', err)
    error.value =
      (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Ошибка входа.'
  }
}

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value) {
    error.value = 'Имя, email и пароль обязательны.'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Пароль должен быть не менее 6 символов.'
    return
  }
  error.value = null
  try {
    await authStore.register({ name: name.value, email: email.value, password: password.value })
    router.push('/profile')
  } catch (err: unknown) {
    console.error('Registration Error:', err)
    error.value =
      (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Ошибка регистрации.'
  }
}

const handleForgotPassword = async () => {
  if (!email.value) {
    error.value = 'Email обязателен.'
    return
  }
  error.value = null
  message.value = null
  forgotSending.value = true
  try {
    await apiClient.post('/auth/forgot-password', { email: email.value })
    message.value = 'Если пользователь с таким email существует, инструкция отправлена на почту.'
    email.value = ''
  } catch (e: unknown) {
    error.value =
      (e as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Ошибка отправки'
  } finally {
    forgotSending.value = false
  }
}

const handleResetPassword = async () => {
  if (!newPassword.value) {
    error.value = 'Пароль обязателен.'
    return
  }
  if (newPassword.value.length < 6) {
    error.value = 'Пароль должен быть не менее 6 символов.'
    return
  }
  if (newPassword.value !== newPasswordConfirm.value) {
    error.value = 'Пароли не совпадают.'
    return
  }
  error.value = null
  message.value = null
  resetSending.value = true
  try {
    await apiClient.post('/auth/reset-password', {
      token: resetToken.value,
      newPassword: newPassword.value,
    })
    message.value = 'Пароль успешно изменён! Сейчас вы будете перенаправлены на вход.'
    setTimeout(() => {
      router.push('/auth')
      switchMode('login')
    }, 2000)
  } catch (e: unknown) {
    error.value =
      (e as { response?: { data?: { message?: string } } }).response?.data?.message ||
      'Ошибка сброса пароля'
  } finally {
    resetSending.value = false
  }
}

onMounted(() => {
  if (route.query.mode === 'reset' && route.query.token) {
    authMode.value = 'resetPassword'
    resetToken.value = route.query.token as string
  }
})
</script>

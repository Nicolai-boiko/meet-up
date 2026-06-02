<template>
  <div class="min-h-screen bg-gray-100 flex flex-col justify-center sm:py-12">
    <div class="p-10 xs:p-0 mx-auto w-full max-w-md">
      <div class="bg-white shadow w-full rounded-lg divide-y divide-gray-200 min-w-80">
        <!-- Tabs -->
        <div v-if="authMode !== 'forgotPassword'" class="p-5">
          <div class="flex justify-around">
            <button @click="switchMode('login')"
              :class="['px-4 py-2 font-bold rounded-md', authMode === 'login' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700']">
              Авторизация
            </button>
            <button @click="switchMode('register')"
              :class="['px-4 py-2 font-bold rounded-md', authMode === 'register' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700']">
              Регистрация
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <div v-if="authMode === 'login'" class="px-5 py-7">
          <form @submit.prevent="handleLogin">
            <label class="font-semibold text-sm text-gray-600 pb-1 block">E-mail</label>
            <input v-model="email" type="email" class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required />
            <label class="font-semibold text-sm text-gray-600 pb-1 block">Пароль</label>
            <input v-model="password" type="password" class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required />
            <div v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</div>
            <button type="submit"
              class="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block">
              <span class="inline-block mr-2">Войти</span>
            </button>
          </form>
          <div class="text-center mt-4">
            <a href="#" @click.prevent="switchMode('forgotPassword')" class="text-sm text-blue-500 hover:underline">
              Забыли пароль?
            </a>
          </div>
        </div>

        <!-- Registration Form -->
        <div v-if="authMode === 'register'" class="px-5 py-7">
          <form @submit.prevent="handleRegister">
            <label class="font-semibold text-sm text-gray-600 pb-1 block">Имя</label>
            <input v-model="name" type="text" class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required />
            <label class="font-semibold text-sm text-gray-600 pb-1 block">E-mail</label>
            <input v-model="email" type="email" class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required />
            <label class="font-semibold text-sm text-gray-600 pb-1 block">Пароль</label>
            <input v-model="password" type="password" class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required />
            <div v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</div>
            <button type="submit"
              class="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block">
              <span class="inline-block mr-2">Зарегистрироваться</span>
            </button>
          </form>
        </div>

        <!-- Forgot Password Form -->
        <div v-if="authMode === 'forgotPassword'" class="px-5 py-7">
          <form @submit.prevent="handleForgotPassword">
            <label class="font-semibold text-sm text-gray-600 pb-1 block">E-mail</label>
            <input v-model="email" type="email" class="border rounded-lg px-3 py-2 mt-1 mb-5 text-sm w-full"
              required />
            <div v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</div>
            <div v-if="message" class="text-green-500 text-sm mb-4">{{ message }}</div>
            <button type="submit"
              class="transition duration-200 bg-blue-500 hover:bg-blue-600 focus:bg-blue-700 focus:shadow-sm focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50 text-white w-full py-2.5 rounded-lg text-sm shadow-sm hover:shadow-md font-semibold text-center inline-block">
              <span class="inline-block mr-2">Отправить</span>
            </button>
          </form>
          <div class="text-center mt-4">
            <a href="#" @click.prevent="switchMode('login')" class="text-sm text-blue-500 hover:underline">
              Вернуться к входу
            </a>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

type AuthMode = 'login' | 'register' | 'forgotPassword';

const router = useRouter();
const authStore = useAuthStore();

const authMode = ref<AuthMode>('login');
const email = ref('');
const password = ref('');
const name = ref('');
const error = ref<string | null>(null);
const message = ref<string | null>(null);

const switchMode = (mode: AuthMode) => {
  authMode.value = mode;
  name.value = '';
  email.value = '';
  password.value = '';
  error.value = null;
  message.value = null;
};

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Email и пароль обязательны.';
    return;
  }
  error.value = null;
  try {
    await authStore.login({ email: email.value, password: password.value });
    router.push('/home');
  } catch (err: any) {
    console.error('Login Error:', err);
    error.value = err.response?.data?.message || 'Ошибка входа.';
  }
};

const handleRegister = async () => {
  if (!name.value || !email.value || !password.value) {
    error.value = 'Имя, email и пароль обязательны.';
    return;
  }
   if (password.value.length < 6) {
    error.value = 'Пароль должен быть не менее 6 символов.';
    return;
  }
  error.value = null;
  try {
    await authStore.register({ name: name.value, email: email.value, password: password.value });
    router.push('/profile');
  } catch (err: any) {
    console.error('Registration Error:', err);
    error.value = err.response?.data?.message || 'Ошибка регистрации.';
  }
};

const handleForgotPassword = () => {
  if (!email.value) {
    error.value = 'Email обязателен.';
    return;
  }
  error.value = null;
  message.value = `Если пользователь с email ${email.value} существует, мы отправили инструкцию по восстановлению пароля.`;
  // NOTE: No actual email is sent as there is no backend functionality for it.
};
</script>

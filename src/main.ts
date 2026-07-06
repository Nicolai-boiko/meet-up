import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import './assets/css/style.css'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)
  app.use(VueQueryPlugin, {
    queryClientConfig: { defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } },
  })

  const authStore = useAuthStore()
  await authStore.tryAutoLogin()

  app.mount('#app')
}

bootstrap()

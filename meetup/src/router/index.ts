import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../pages/Main.vue'),
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../pages/Auth.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../pages/Profile.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/create-call',
      name: 'create-call',
      component: () => import('../pages/CreateCall.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/room/:slug',
      name: 'video-room',
      component: () => import('../pages/VideoRoom.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('../pages/Library.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('../pages/Schedule.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach((to, _from) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'auth' };
  }
});

export default router;

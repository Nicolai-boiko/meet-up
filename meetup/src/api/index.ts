import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Refresh-токен: защита от параллельных 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

function processQueue(error: any, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean; _skipAuthRefresh?: boolean } = error.config;

    // Пропускаем запросы, которые сами являются refresh-запросами
    if (!originalRequest || originalRequest._skipAuthRefresh) {
      return Promise.reject(error);
    }

    // Только на 401 пробуем обновить токен
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Уже была одна попытка — не зацикливаемся
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    const authStore = useAuthStore();

    // Если рефреш уже идёт — встаём в очередь
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      });
    }

    // Пробуем обновить токен
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const ok = await authStore.refreshAccessToken();
      if (ok) {
        const newToken = authStore.token!;
        processQueue(null, newToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } else {
        processQueue(new Error('Refresh failed'), null);
        authStore.logout();
        return Promise.reject(error);
      }
    } catch {
      processQueue(new Error('Refresh failed'), null);
      authStore.logout();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;

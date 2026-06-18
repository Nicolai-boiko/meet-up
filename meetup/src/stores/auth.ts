import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '../api';
import type { UserCredentials, UserProfile } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const userId = ref<string | null>(localStorage.getItem('userId'));
  const userRole = ref<string>('USER');
  const profile = ref<UserProfile | null>(null);
  const authReady = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => userRole.value === 'ADMIN');

  const displayName = computed(() => {
    if (profile.value) {
      const first = profile.value.firstName;
      const last = profile.value.lastName;
      if (first && last) return `${first} ${last}`;
      if (first) return first;
    }
    return profile.value?.name ?? `Участник #${userId.value}`;
  });

  const initials = computed(() => {
    if (profile.value) {
      const f = profile.value.firstName?.charAt(0)?.toUpperCase() ?? '';
      const l = profile.value.lastName?.charAt(0)?.toUpperCase() ?? '';
      if (f || l) return `${f}${l}`;
      return profile.value.name?.charAt(0)?.toUpperCase() ?? '?';
    }
    return '?';
  });

  function setTokens(newToken: string, newUserId: string, newRefreshToken?: string) {
    token.value = newToken;
    userId.value = newUserId;
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    if (newRefreshToken) {
      refreshToken.value = newRefreshToken;
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }

  function clearAuthData() {
    token.value = null;
    refreshToken.value = null;
    userId.value = null;
    userRole.value = 'USER';
    profile.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    delete apiClient.defaults.headers.common['Authorization'];
  }

  async function register(credentials: UserCredentials) {
    const response = await apiClient.post<{ token: string; refreshToken: string; userId: number }>(
      '/auth/register',
      credentials,
    );
    setTokens(response.data.token, response.data.userId.toString(), response.data.refreshToken);
    await fetchProfile();
  }

  async function login(credentials: UserCredentials) {
    const response = await apiClient.post<{ token: string; refreshToken: string; userId: string }>(
      '/auth/login',
      credentials,
    );
    setTokens(response.data.token, response.data.userId.toString(), response.data.refreshToken);
    await fetchProfile();
  }

  async function refreshAccessToken(): Promise<boolean> {
    if (!refreshToken.value) return false;
    try {
      const response = await apiClient.post<{ token: string; refreshToken: string; userId: number; role: string }>(
        '/auth/refresh',
        { refreshToken: refreshToken.value },
        // Не используем interceptor для этого запроса — бирка чтобы избежать петли
        { _skipAuthRefresh: true } as any,
      );
      setTokens(response.data.token, response.data.userId.toString(), response.data.refreshToken);
      userRole.value = response.data.role;
      return true;
    } catch {
      clearAuthData();
      return false;
    }
  }

  async function logout() {
    try {
      if (refreshToken.value) {
        await apiClient.post('/auth/logout', { refreshToken: refreshToken.value });
      }
    } catch {
      // Игнорируем ошибки при logout
    }
    clearAuthData();
  }

  async function tryAutoLogin() {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedRefreshToken && storedUserId) {
      // Пробуем обновить access-токен через refresh
      refreshToken.value = storedRefreshToken;
      const ok = await refreshAccessToken();
      if (ok) {
        await fetchProfile();
        authReady.value = true;
        return;
      }
    }

    if (storedToken && storedUserId) {
      setTokens(storedToken, storedUserId);
      await fetchProfile();
    }

    authReady.value = true;
  }

  async function fetchProfile() {
    try {
      const response = await apiClient.get<UserProfile>('/profile');
      profile.value = response.data;
      userRole.value = response.data.role || 'USER';
    } catch (error) {
      console.error('Failed to fetch profile', error);
      clearAuthData();
    }
  }

  async function updateProfile(data: Partial<UserProfile>) {
    const response = await apiClient.put<UserProfile>('/profile', data);
    profile.value = response.data;
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await apiClient.put('/profile/password', { currentPassword, newPassword });
  }

  async function uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await apiClient.post<UserProfile>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    profile.value = response.data;
  }

  return {
    token,
    refreshToken,
    userId,
    userRole,
    profile,
    authReady,
    isAuthenticated,
    isAdmin,
    displayName,
    initials,
    register,
    login,
    refreshAccessToken,
    logout,
    tryAutoLogin,
    fetchProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
  };
});

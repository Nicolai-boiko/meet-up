import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '../api';
import type { UserCredentials, UserProfile } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
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

  function setToken(newToken: string, newUserId: string) {
    token.value = newToken;
    userId.value = newUserId;
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }

  function clearAuthData() {
    token.value = null;
    userId.value = null;
    userRole.value = 'USER';
    profile.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    delete apiClient.defaults.headers.common['Authorization'];
  }

  async function register(credentials: UserCredentials) {
    const response = await apiClient.post<{ token: string; userId: number }>(
      '/auth/register',
      credentials,
    );
    setToken(response.data.token, response.data.userId.toString());
    await fetchProfile();
  }

  async function login(credentials: UserCredentials) {
    const response = await apiClient.post<{ token: string; userId: string }>('/auth/login', credentials);
    setToken(response.data.token, response.data.userId.toString());
    await fetchProfile();
  }

  function logout() {
    clearAuthData();
  }

  async function tryAutoLogin() {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (storedToken && storedUserId) {
      setToken(storedToken, storedUserId);
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
    logout,
    tryAutoLogin,
    fetchProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
  };
});

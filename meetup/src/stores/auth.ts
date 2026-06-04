import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '../api';
import type { UserCredentials, UserProfile } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'));
  const userId = ref<string | null>(localStorage.getItem('userId'));
  const profile = ref<UserProfile | null>(null);

  const isAuthenticated = computed(() => !!token.value);

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

  function setAuthData(newToken: string, newUserId: string) {
    token.value = newToken;
    userId.value = newUserId;
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  }

  function clearAuthData() {
    token.value = null;
    userId.value = null;
    profile.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    delete apiClient.defaults.headers.common['Authorization'];
  }

  async function register(credentials: UserCredentials) {
    const response = await apiClient.post<{ token: string; userId: number; message: string }>(
      '/auth/register',
      credentials,
    );
    const { token: newToken, userId: newUserId } = response.data;
    setAuthData(newToken, newUserId.toString());
    await fetchProfile();
  }

  async function login(credentials: UserCredentials) {
    const response = await apiClient.post<{ token: string; userId: string }>('/auth/login', credentials);
    const { token: newToken, userId: newUserId } = response.data;
    setAuthData(newToken, newUserId.toString());
    await fetchProfile();
  }

  function logout() {
    clearAuthData();
  }

  function tryAutoLogin() {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (storedToken && storedUserId) {
      setAuthData(storedToken, storedUserId);
    }
  }

  async function fetchProfile() {
    try {
      const response = await apiClient.get<UserProfile>('/profile');
      profile.value = response.data;
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  }

  async function updateProfile(data: Partial<UserProfile>) {
    const response = await apiClient.put<UserProfile>('/profile', data);
    profile.value = response.data;
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    await apiClient.put('/profile/password', { currentPassword, newPassword });
  }

  return {
    token,
    userId,
    profile,
    isAuthenticated,
    displayName,
    initials,
    register,
    login,
    logout,
    tryAutoLogin,
    fetchProfile,
    updateProfile,
    changePassword,
  };
});

import { ref } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '../api';
import type { ContentItem } from '../types';

export const useContentStore = defineStore('content', () => {
  const items = ref<ContentItem[]>([]);
  const current = ref<ContentItem | null>(null);
  const loading = ref(false);

  async function fetchAll() {
    loading.value = true;
    try {
      const { data } = await apiClient.get<ContentItem[]>('/content');
      items.value = data;
    } catch (e) {
      console.error('fetchAll error:', e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchById(id: number) {
    try {
      const { data } = await apiClient.get<ContentItem>(`/content/${id}`);
      current.value = data;
      // Update in list too
      const idx = items.value.findIndex((i) => i.id === id);
      if (idx >= 0) items.value[idx] = data;
    } catch (e) {
      console.error('fetchById error:', e);
    }
  }

  async function create(payload: { title: string; type: string; body?: string | null; mediaUrl?: string | null }) {
    const { data } = await apiClient.post<ContentItem>('/content', payload);
    items.value.unshift(data);
    current.value = data;
    return data;
  }

  async function update(id: number, payload: { title?: string; type?: string; body?: string | null; mediaUrl?: string | null }) {
    const { data } = await apiClient.put<ContentItem>(`/content/${id}`, payload);
    current.value = data;
    const idx = items.value.findIndex((i) => i.id === id);
    if (idx >= 0) items.value[idx] = data;
    return data;
  }

  async function remove(id: number) {
    await apiClient.delete(`/content/${id}`);
    items.value = items.value.filter((i) => i.id !== id);
    if (current.value?.id === id) current.value = null;
  }

  return { items, current, loading, fetchAll, fetchById, create, update, remove };
});

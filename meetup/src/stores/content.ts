import { ref } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '../api';
import type { ContentItem, PaginatedResponse } from '../types';

export const useContentStore = defineStore('content', () => {
  const items = ref<ContentItem[]>([]);
  const current = ref<ContentItem | null>(null);
  const loading = ref(false);
  const loadingMore = ref(false);
  const page = ref(1);
  const total = ref(0);
  const limit = 20;

  const hasMore = ref(false);

  async function fetchPage(pageNum: number) {
    loading.value = true;
    try {
      const { data } = await apiClient.get<PaginatedResponse<ContentItem>>('/content', {
        params: { page: pageNum, limit },
      });
      items.value = data.items;
      page.value = data.page;
      total.value = data.total;
      hasMore.value = data.page < data.totalPages;
    } catch (e) {
      console.error('fetchPage error:', e);
    } finally {
      loading.value = false;
    }
  }

  async function fetchMore() {
    if (loadingMore.value || !hasMore.value) return;
    loadingMore.value = true;
    try {
      const nextPage = page.value + 1;
      const { data } = await apiClient.get<PaginatedResponse<ContentItem>>('/content', {
        params: { page: nextPage, limit },
      });
      items.value = [...items.value, ...data.items];
      page.value = data.page;
      total.value = data.total;
      hasMore.value = data.page < data.totalPages;
    } catch (e) {
      console.error('fetchMore error:', e);
    } finally {
      loadingMore.value = false;
    }
  }

  async function fetchById(id: number) {
    try {
      const { data } = await apiClient.get<ContentItem>(`/content/${id}`);
      current.value = data;
      const idx = items.value.findIndex((i) => i.id === id);
      if (idx >= 0) items.value[idx] = data;
    } catch (e) {
      console.error('fetchById error:', e);
    }
  }

  async function create(payload: { title: string; type: string; body?: string | null; mediaUrl?: string | null }) {
    const { data } = await apiClient.post<ContentItem>('/content', payload);
    items.value.unshift(data);
    total.value++;
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
    total.value = Math.max(0, total.value - 1);
    if (current.value?.id === id) current.value = null;
  }

  return { items, current, loading, loadingMore, page, total, limit, hasMore, fetchPage, fetchMore, fetchById, create, update, remove };
});

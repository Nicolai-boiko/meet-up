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

  const sortBy = ref<string>('createdAt');
  const sortOrder = ref<string>('desc');

  async function fetchPage(pageNum: number, tagId?: number, favorites?: boolean) {
    loading.value = true;
    try {
      const params: any = { page: pageNum, limit, sortBy: sortBy.value, sortOrder: sortOrder.value };
      if (tagId) params.tagId = tagId;
      if (favorites) params.favorites = '1';
      const { data } = await apiClient.get<PaginatedResponse<ContentItem>>('/content', { params });
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

  async function fetchMore(tagId?: number) {
    if (loadingMore.value || !hasMore.value) return;
    loadingMore.value = true;
    try {
      const nextPage = page.value + 1;
      const params: any = { page: nextPage, limit, sortBy: sortBy.value, sortOrder: sortOrder.value };
      if (tagId) params.tagId = tagId;
      const { data } = await apiClient.get<PaginatedResponse<ContentItem>>('/content', { params });
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

  async function create(payload: { title: string; type: string; body?: string | null; mediaUrl?: string | null; tagIds?: number[]; file?: File | null; files?: File[] }) {
    let data: ContentItem;
    if (payload.file || payload.files?.length) {
      const form = new FormData();
      form.append('title', payload.title);
      form.append('type', payload.type);
      if (payload.body) form.append('body', payload.body);
      if (payload.tagIds?.length) {
        payload.tagIds.forEach((id) => form.append('tagIds', String(id)));
      }
      if (payload.file) form.append('file', payload.file);
      if (payload.files?.length) {
        payload.files.forEach((f) => form.append('files', f));
      }
      const res = await apiClient.post<ContentItem>('/content', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      data = res.data;
    } else {
      const res = await apiClient.post<ContentItem>('/content', payload);
      data = res.data;
    }
    items.value.unshift(data);
    total.value++;
    current.value = data;
    return data;
  }

  async function update(id: number, payload: { title?: string; type?: string; body?: string | null; mediaUrl?: string | null; tagIds?: number[]; file?: File | null; files?: File[] }) {
    let data: ContentItem;
    if (payload.file || payload.files?.length) {
      const form = new FormData();
      if (payload.title) form.append('title', payload.title);
      if (payload.type) form.append('type', payload.type);
      if (payload.body !== undefined) form.append('body', payload.body ?? '');
      if (payload.tagIds) {
        payload.tagIds.forEach((tid) => form.append('tagIds', String(tid)));
      }
      if (payload.file) form.append('file', payload.file);
      if (payload.files?.length) {
        payload.files.forEach((f) => form.append('files', f));
      }
      const res = await apiClient.put<ContentItem>(`/content/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      data = res.data;
    } else {
      const res = await apiClient.put<ContentItem>(`/content/${id}`, payload);
      data = res.data;
    }
    current.value = data;
    const idx = items.value.findIndex((i) => i.id === id);
    if (idx >= 0) items.value[idx] = data;
    return data;
  }

  async function toggleFavorite(id: number) {
    const { data } = await apiClient.post<{ favorited: boolean }>(`/content/${id}/favorite`);
    // Обновляем isFavorited во всех списках
    const update = (item: ContentItem | null) => { if (item && item.id === id) item.isFavorited = data.favorited; };
    items.value.forEach(update);
    if (current.value) update(current.value);
    return data.favorited;
  }

  async function uploadFile(contentId: number, file: File) {
    const form = new FormData();
    form.append('file', file);
    const { data } = await apiClient.post<ContentFile>(`/content/${contentId}/files`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // Добавляем файл в current и в items
    const addFile = (item: ContentItem | null) => {
      if (item && item.id === contentId) {
        if (!item.files) item.files = [];
        item.files.push(data);
      }
    };
    items.value.forEach(addFile);
    if (current.value) addFile(current.value);
    return data;
  }

  async function deleteFile(contentId: number, fileId: number) {
    await apiClient.delete(`/content/${contentId}/files/${fileId}`);
    const removeFile = (item: ContentItem | null) => {
      if (item && item.id === contentId && item.files) {
        item.files = item.files.filter((f) => f.id !== fileId);
      }
    };
    items.value.forEach(removeFile);
    if (current.value) removeFile(current.value);
  }

  async function remove(id: number) {
    await apiClient.delete(`/content/${id}`);
    items.value = items.value.filter((i) => i.id !== id);
    total.value = Math.max(0, total.value - 1);
    if (current.value?.id === id) current.value = null;
  }

  return { items, current, loading, loadingMore, page, total, limit, hasMore, sortBy, sortOrder, fetchPage, fetchMore, fetchById, create, update, remove, toggleFavorite, uploadFile, deleteFile };
});

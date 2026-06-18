import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '../api';
import type { Meetup, MeetingParticipantStatus, PaginatedResponse } from '../types';

export const useMeetupStore = defineStore('meetups', () => {
  const loading = ref(false);
  const items = ref<Meetup[]>([]);
  const selectedUserIds = ref<number[]>([]);

  // Pagination
  const page = ref(1);
  const total = ref(0);
  const limit = 20;
  const hasMore = ref(false);

  const upcomingMeetups = computed(() =>
    items.value
      .filter((m) => new Date(m.startTime) > new Date())
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
  );

  const pastMeetups = computed(() =>
    items.value
      .filter((m) => new Date(m.endTime) <= new Date())
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
  );

  function getMeetupById(id: number) {
    return items.value.find((m) => m.id === id) ?? null;
  }

  function getParticipantStatus(meetup: Meetup, userId: number): MeetingParticipantStatus | null {
    const p = meetup.participants?.find((p) => p.id === userId);
    return p?.status ?? null;
  }

  function isParticipant(meetup: Meetup, userId: number): boolean {
    return getParticipantStatus(meetup, userId) === 'ACCEPTED';
  }

  function isInvited(meetup: Meetup, userId: number): boolean {
    return getParticipantStatus(meetup, userId) === 'INVITED';
  }

  function isDeclined(meetup: Meetup, userId: number): boolean {
    return getParticipantStatus(meetup, userId) === 'DECLINED';
  }

  function isHost(meetup: Meetup, userId: number): boolean {
    return meetup.hostId === userId;
  }

  const calendarItems = computed(() =>
    items.value.map((m) => ({
      ...m,
      participants: m.participants?.filter((p) => p.status !== 'DECLINED') ?? [],
    })),
  );

  async function fetchMeetups(userIds?: number[]) {
    loading.value = true;
    try {
      const params: any = { page: 1, limit };
      const ids = userIds ?? selectedUserIds.value;
      if (ids.length > 0) {
        params.userIds = ids.join(',');
      }
      const { data } = await apiClient.get<PaginatedResponse<Meetup>>('/meetups', { params });
      items.value = data.items;
      page.value = data.page;
      total.value = data.total;
      hasMore.value = data.page < data.totalPages;
    } catch (error) {
      console.error('Failed to fetch meetups', error);
    } finally {
      loading.value = false;
    }
  }

  // Для календаря — загружаем всё (большой limit)
  async function fetchAllForCalendar(userIds?: number[]) {
    loading.value = true;
    try {
      const params: any = { page: 1, limit: 200 };
      const ids = userIds ?? selectedUserIds.value;
      if (ids.length > 0) {
        params.userIds = ids.join(',');
      }
      const { data } = await apiClient.get<PaginatedResponse<Meetup>>('/meetups', { params });
      items.value = data.items;
      total.value = data.total;
      hasMore.value = false;
    } catch (error) {
      console.error('Failed to fetch meetups for calendar', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchMore() {
    if (!hasMore.value) return;
    try {
      const nextPage = page.value + 1;
      const params: any = { page: nextPage, limit };
      if (selectedUserIds.value.length > 0) {
        params.userIds = selectedUserIds.value.join(',');
      }
      const { data } = await apiClient.get<PaginatedResponse<Meetup>>('/meetups', { params });
      items.value = [...items.value, ...data.items];
      page.value = data.page;
      total.value = data.total;
      hasMore.value = data.page < data.totalPages;
    } catch (error) {
      console.error('Failed to fetch more meetups', error);
    }
  }

  async function createMeetup(payload: {
    title: string;
    description?: string | null;
    startTime: string;
    endTime: string;
    roomId?: number | null;
    participantIds?: number[];
  }) {
    const { data } = await apiClient.post<{ message: string; data: Meetup }>('/meetups', payload);
    items.value.unshift(data.data);
    total.value++;
    return data.data;
  }

  async function updateMeetup(id: number, payload: {
    title?: string;
    description?: string | null;
    startTime?: string;
    endTime?: string;
    roomId?: number | null;
    participantIds?: number[];
  }) {
    const { data } = await apiClient.put<{ message: string; data: Meetup }>(`/meetups/${id}`, payload);
    const idx = items.value.findIndex((m) => m.id === id);
    if (idx >= 0) items.value[idx] = data.data;
    return data.data;
  }

  async function deleteMeetup(id: number) {
    await apiClient.delete(`/meetups/${id}`);
    items.value = items.value.filter((m) => m.id !== id);
    total.value = Math.max(0, total.value - 1);
  }

  async function joinMeetup(id: number) {
    const { data } = await apiClient.post<{ message: string; data: Meetup }>(`/meetups/${id}/join`);
    const idx = items.value.findIndex((m) => m.id === id);
    if (idx >= 0) items.value[idx] = data.data;
    return data.data;
  }

  async function declineMeetup(id: number) {
    const { data } = await apiClient.post<{ message: string; data: Meetup }>(`/meetups/${id}/decline`);
    const idx = items.value.findIndex((m) => m.id === id);
    if (idx >= 0) items.value[idx] = data.data;
    return data.data;
  }

  function setSelectedUsers(ids: number[]) {
    selectedUserIds.value = ids;
  }

  return {
    loading,
    items,
    upcomingMeetups,
    pastMeetups,
    calendarItems,
    selectedUserIds,
    hasMore,
    fetchMeetups,
    fetchAllForCalendar,
    fetchMore,
    getMeetupById,
    getParticipantStatus,
    isParticipant,
    isInvited,
    isDeclined,
    isHost,
    createMeetup,
    updateMeetup,
    deleteMeetup,
    joinMeetup,
    declineMeetup,
    setSelectedUsers,
  };
});

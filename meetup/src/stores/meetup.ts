import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '../api';
import type { Meetup, MeetingParticipantStatus } from '../types';

export const useMeetupStore = defineStore('meetups', () => {
  const loading = ref(false);
  const items = ref<Meetup[]>([]);
  const selectedUserIds = ref<number[]>([]);

  // Все встречи (включая те, где юзер только приглашён)
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

  // Для календаря: показываем INVITED (затемнённые) + ACCEPTED, исключаем DECLINED
  const calendarItems = computed(() =>
    items.value.map((m) => ({
      ...m,
      participants: m.participants?.filter((p) => p.status !== 'DECLINED') ?? [],
    })),
  );

  async function fetchMeetups(userIds?: number[]) {
    loading.value = true;
    try {
      const params: any = {};
      const ids = userIds ?? selectedUserIds.value;
      if (ids.length > 0) {
        params.userIds = ids.join(',');
      }
      const { data } = await apiClient.get<Meetup[]>('/meetups', { params });
      items.value = data;
    } catch (error) {
      console.error('Failed to fetch meetups', error);
    } finally {
      loading.value = false;
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
    fetchMeetups,
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

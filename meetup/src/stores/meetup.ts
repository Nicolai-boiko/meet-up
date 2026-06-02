import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import apiClient from '../api';
import type { Meetup } from '../types';

export const useMeetupStore = defineStore('meetups', () => {
  const loading = ref(false);
  const items = ref<Meetup[]>([]);

  const upcomingMeetups = computed(() =>
    items.value
      ?.filter((meet) => new Date(meet.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((meet) => ({ ...meet, date: new Date(meet.date).toLocaleString('ru-RU', { timeZone: 'UTC' }) }))
  );

  const pastMeetups = computed(() =>
    items.value
      ?.filter((meet) => new Date(meet.date) <= new Date())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((meet) => ({ ...meet, date: new Date(meet.date).toLocaleString('ru-RU', { timeZone: 'UTC' }) }))
  );

  function getMeetupById(id: string) {
    return items.value?.find((meet) => meet.id === id);
  }

  async function fetchMeetups() {
    loading.value = true;
    try {
      const response = await apiClient.get<Meetup[]>('/meetups');
      items.value = response.data;
    } catch (error) {
      console.error('Failed to fetch meetups', error);
    } finally {
      loading.value = false;
    }
  }

  return { loading, items, upcomingMeetups, pastMeetups, fetchMeetups, getMeetupById };
});

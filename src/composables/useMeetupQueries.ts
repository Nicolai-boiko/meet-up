import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient from '../api'
import type { Meetup, PaginatedResponse } from '../types'
import type { MeetupQueryParams } from '../interfaces'

const ALL_MEETUPS = ['meetups'] as const

export function useMeetupList(params: () => MeetupQueryParams) {
  return useQuery({
    queryKey: ALL_MEETUPS,
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Meetup>>('/meetups', {
        params: params(),
      })
      return data
    },
  })
}

export function useMeetupById(id: () => number | null) {
  return useQuery({
    queryKey: ['meetups', 'detail', id()] as const,
    queryFn: async () => {
      const { data } = await apiClient.get<Meetup>(`/meetups/${id()}`)
      return data
    },
    enabled: () => id() !== null,
  })
}

export function useCreateMeetup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await apiClient.post<{ data: Meetup }>('/meetups', payload)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_MEETUPS }),
  })
}

export function useUpdateMeetup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, unknown> }) => {
      const { data } = await apiClient.put<{ data: Meetup }>(`/meetups/${id}`, payload)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_MEETUPS }),
  })
}

export function useDeleteMeetup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, scope }: { id: number; scope?: string }) => {
      await apiClient.delete(`/meetups/${id}`, { data: { scope } })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_MEETUPS }),
  })
}

export function useJoinMeetup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.post<{ data: Meetup }>(`/meetups/${id}/join`)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_MEETUPS }),
  })
}

export function useDeclineMeetup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      const { data } = await apiClient.post<{ data: Meetup }>(`/meetups/${id}/decline`)
      return data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_MEETUPS }),
  })
}

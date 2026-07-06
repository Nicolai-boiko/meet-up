import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient from '../api'
import type { UserSummary, PaginatedResponse } from '../types'
import type { UserQueryParams } from '../interfaces'

export const userKeys = {
  all: ['users'] as const,
  list: (params: UserQueryParams) => ['users', 'list', params] as const,
}

export function useUserList(params: () => UserQueryParams) {
  return useQuery({
    queryKey: () => userKeys.list(params()),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<UserSummary>>('/users', {
        params: params(),
      })
      return data
    },
  })
}

export function useUpdateUserRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      await apiClient.put(`/users/${id}/role`, { role })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.all }),
  })
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'] as const,
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/stats')
      return data
    },
    staleTime: 60_000,
  })
}

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'] as const,
    queryFn: async () => {
      const { data } = await apiClient.get('/rooms')
      return data
    },
    staleTime: 30_000,
  })
}

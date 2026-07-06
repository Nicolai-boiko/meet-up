import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient from '../api'
import type { ContentItem, PaginatedResponse, Tag } from '../types'
import type { ContentQueryParams } from '../interfaces'

export const contentKeys = {
  all: ['content'] as readonly unknown[],
  list: (params: ContentQueryParams): readonly unknown[] => ['content', 'list', params],
  byId: (id: number): readonly unknown[] => ['content', 'detail', id],
}

export function useContentList(params: () => ContentQueryParams) {
  return useQuery({
    queryKey: () => contentKeys.list(params()),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<ContentItem>>('/content', {
        params: params(),
      })
      return data
    },
  })
}

export function useContentById(id: () => number | null) {
  return useQuery({
    queryKey: () => contentKeys.byId(id()!),
    queryFn: async () => {
      const { data } = await apiClient.get<ContentItem>(`/content/${id()}`)
      return data
    },
    enabled: () => id() !== null,
  })
}

export function useCreateContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (form: FormData) => {
      const { data } = await apiClient.post<ContentItem>('/content', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKeys.all }),
  })
}

export function useUpdateContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, form }: { id: number; form: FormData }) => {
      const { data } = await apiClient.put<ContentItem>(`/content/${id}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKeys.all }),
  })
}

export function useDeleteContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/content/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKeys.all }),
  })
}

export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (contentId: number) => {
      const { data } = await apiClient.post<{ favorited: boolean }>(
        `/content/${contentId}/favorite`,
      )
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKeys.all }),
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'] as readonly unknown[],
    queryFn: async () => {
      const { data } = await apiClient.get<Tag[]>('/tags')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { data } = await apiClient.post<Tag>('/tags', { name })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tags'] }),
  })
}

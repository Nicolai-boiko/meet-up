import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient from '../api'
import type { ContentItem, PaginatedResponse, Tag } from '../types'
import type { ContentQueryParams } from '../interfaces'

const ALL_CONTENT = ['content'] as const
const ALL_TAGS = ['tags'] as const

export function useContentList(params: () => ContentQueryParams) {
  return useQuery({
    queryKey: ALL_CONTENT,
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
    queryKey: ['content', 'detail', id()] as const,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_CONTENT }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_CONTENT }),
  })
}

export function useDeleteContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/content/${id}`)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_CONTENT }),
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_CONTENT }),
  })
}

export function useTags() {
  return useQuery({
    queryKey: ALL_TAGS,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: ALL_TAGS }),
  })
}

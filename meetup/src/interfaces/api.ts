/** Параметры запроса для списка материалов библиотеки */
export interface ContentQueryParams {
  page: number
  limit: number
  sortBy: string
  sortOrder: string
  tagId?: number
  favorites?: string
}

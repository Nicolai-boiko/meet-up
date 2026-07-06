/** Типизированная ошибка axios */
export interface AxiosError {
  response?: { data?: { message?: string } }
}

/** Параметры запроса для списка встреч */
export interface MeetupQueryParams {
  page: number
  limit: number
  userIds?: string
}

/** Параметры запроса для списка пользователей */
export interface UserQueryParams {
  page: number
  limit: number
  sortBy: string
  sortOrder: string
  search?: string
}

/** Параметры запроса для списка материалов библиотеки */
export interface ContentQueryParams {
  page: number
  limit: number
  sortBy: string
  sortOrder: string
  tagId?: number
  favorites?: string
}

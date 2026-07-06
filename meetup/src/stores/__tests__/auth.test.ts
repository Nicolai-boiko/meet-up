import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock axios — use vi.hoisted to avoid hoisting issues
const { mockPost, mockGet, mockPut } = vi.hoisted(() => ({
  mockPost: vi.fn(),
  mockGet: vi.fn(),
  mockPut: vi.fn(),
}))

vi.mock('../../api', () => ({
  default: {
    post: mockPost,
    get: mockGet,
    put: mockPut,
    defaults: {
      headers: {
        common: {} as Record<string, string>,
      },
    },
  },
}))

import { useAuthStore } from '../auth'

const mockProfile = {
  id: 1,
  email: 'test@example.com',
  name: 'TestUser',
  role: 'USER',
  firstName: 'Test',
  lastName: 'User',
  birthDate: null,
  avatar: null,
  createdAt: new Date().toISOString(),
}

describe('authStore', () => {
  beforeEach(() => {
    localStorageMock.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with values from localStorage', () => {
    localStorageMock.setItem('token', 'stored-token')
    localStorageMock.setItem('refreshToken', 'stored-refresh')
    localStorageMock.setItem('userId', '42')

    const store = useAuthStore()
    expect(store.token).toBe('stored-token')
    expect(store.refreshToken).toBe('stored-refresh')
    expect(store.userId).toBe('42')
  })

  it('isAuthenticated is false when no token', () => {
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
  })

  it('isAuthenticated is true when token exists', () => {
    localStorageMock.setItem('token', 'abc123')
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(true)
  })

  it('isAdmin returns true for ADMIN role', () => {
    localStorageMock.setItem('token', 'admin-token')
    const store = useAuthStore()
    store.userRole = 'ADMIN'
    expect(store.isAdmin).toBe(true)
  })

  it('displayName returns full name when firstName and lastName are set', () => {
    const store = useAuthStore()
    store.profile = mockProfile
    expect(store.displayName).toBe('Test User')
  })

  it('initials returns first letters of first and last name', () => {
    const store = useAuthStore()
    store.profile = mockProfile
    expect(store.initials).toBe('TU')
  })

  it('register sets tokens and fetches profile', async () => {
    mockPost.mockResolvedValueOnce({
      data: { token: 'new-token', refreshToken: 'new-refresh', userId: 99 },
    })
    mockGet.mockResolvedValueOnce({ data: mockProfile })

    const store = useAuthStore()
    await store.register({ email: 'a@b.com', password: 'pass', name: 'A' })

    expect(store.token).toBe('new-token')
    expect(store.refreshToken).toBe('new-refresh')
    expect(store.userId).toBe('99')
    expect(store.profile).toEqual(mockProfile)
    expect(localStorageMock.getItem('token')).toBe('new-token')
  })

  it('logout clears auth data', async () => {
    mockPost.mockResolvedValueOnce({ data: {} })

    localStorageMock.setItem('token', 't')
    localStorageMock.setItem('refreshToken', 'rt')
    localStorageMock.setItem('userId', '1')

    const store = useAuthStore()
    store.token = 't'
    store.refreshToken = 'rt'
    store.userId = '1'
    store.profile = mockProfile

    await store.logout()

    expect(store.token).toBeNull()
    expect(store.refreshToken).toBeNull()
    expect(store.profile).toBeNull()
    expect(localStorageMock.getItem('token')).toBeNull()
  })
})

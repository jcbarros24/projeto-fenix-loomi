import { create } from 'zustand'

import { getCookie, removeCookie, setCookie } from '@/lib/cookies'
import { apiFetch, ApiError, setUnauthorizedHandler } from '@/services/api'
import { LoginResponse, User } from '@/types/auth'

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hydrateSession: () => void
}

type AuthStateSetter = (partial: Partial<AuthState>) => void

const ACCESS_TOKEN_KEY = 'access_token'
const USER_STORAGE_KEY = 'user'

const persistSession = (
  token: string,
  user: User,
  setState: AuthStateSetter,
) => {
  setCookie(ACCESS_TOKEN_KEY, token)
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  }
  setState({ user, isAuthenticated: true })
}

const clearSession = (setState: AuthStateSetter) => {
  removeCookie(ACCESS_TOKEN_KEY)
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
  setState({ user: null, isAuthenticated: false })
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string) => {
    try {
      const response = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
      })

      persistSession(response.access_token, response.user, set)
      if (typeof window !== 'undefined') {
        window.location.assign('/dashboard')
      }
    } catch (error) {
      const apiError = error as ApiError
      const shouldFallback = [404, 501].includes(apiError.status)

      if (!shouldFallback) {
        throw error
      }

      const fallbackUser: User = {
        id: `mock-${email.toLowerCase()}`,
        name: email.split('@')[0] || 'Usuario',
        email,
      }

      persistSession('mock-token', fallbackUser, set)
      if (typeof window !== 'undefined') {
        window.location.assign('/dashboard')
      }
    }
  },
  logout: () => {
    clearSession(set)
    if (typeof window !== 'undefined') {
      window.location.assign('/login')
    }
  },
  hydrateSession: () => {
    const token = getCookie(ACCESS_TOKEN_KEY)
    if (typeof window === 'undefined') {
      set({ user: null, isAuthenticated: false })
      return
    }

    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (!token || !storedUser) {
      clearSession(set)
      return
    }

    try {
      const user = JSON.parse(storedUser) as User
      set({ user, isAuthenticated: true })
    } catch {
      clearSession(set)
    }
  },
}))

setUnauthorizedHandler(() => {
  useAuthStore.getState().logout()
})

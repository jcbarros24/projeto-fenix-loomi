import { create } from 'zustand'

import { getCookie, removeCookie, setCookie } from '@/lib/cookies'
import { apiFetch, ApiError, setUnauthorizedHandler } from '@/services/api'
import { LoginResponse, User } from '@/types/auth'

type AuthState = {
  user: User | null
  isAuthenticated: boolean
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>
  logout: () => void
  hydrateSession: () => Promise<void>
}

type AuthStateSetter = (partial: Partial<AuthState>) => void

const ACCESS_TOKEN_KEY = 'access_token'
const USER_STORAGE_KEY = 'user'

type JwtPayload = {
  sub?: string
  user_id?: string
  id?: string
}

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

  if (typeof window !== 'undefined') {
    return window.atob(padded)
  }

  return Buffer.from(padded, 'base64').toString('utf-8')
}

const getUserIdFromToken = (token: string) => {
  try {
    const [, payload] = token.split('.')
    if (!payload) return null

    const parsed = JSON.parse(decodeBase64Url(payload)) as JwtPayload
    return parsed.sub ?? parsed.user_id ?? parsed.id ?? null
  } catch {
    return null
  }
}

const getUserFromApi = async (token: string): Promise<User | null> => {
  const userId = getUserIdFromToken(token)
  if (!userId) return null

  try {
    return await apiFetch<User>(`/users/${userId}`, {
      method: 'GET',
      skipAuth: true,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    return null
  }
}

const persistSession = (
  token: string,
  user: User | null,
  setState: AuthStateSetter,
  rememberMe = false,
) => {
  if (rememberMe) {
    setCookie(ACCESS_TOKEN_KEY, token, { maxAgeDays: 30 })
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      } else {
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }
  } else {
    setCookie(ACCESS_TOKEN_KEY, token, { maxAgeDays: 0 })
    if (typeof window !== 'undefined') {
      if (user) {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      } else {
        sessionStorage.removeItem(USER_STORAGE_KEY)
      }
    }
  }
  setState({ user, isAuthenticated: true })
}

const clearSession = (setState: AuthStateSetter) => {
  removeCookie(ACCESS_TOKEN_KEY)
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_STORAGE_KEY)
    sessionStorage.removeItem(USER_STORAGE_KEY)
  }
  setState({ user: null, isAuthenticated: false })
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
        skipAuth: true,
      })

      const user = await getUserFromApi(response.access_token)
      persistSession(response.access_token, user, set, rememberMe)
      if (typeof window !== 'undefined') {
        window.location.assign('/dashboard')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if ([400, 401, 403].includes(error.status)) {
          throw new Error('Usuário ou senha inválidos.')
        }

        if (error.status === 404) {
          throw new Error('Serviço de autenticação indisponível no momento.')
        }
      }

      throw error
    }
  },
  logout: () => {
    clearSession(set)
    if (typeof window !== 'undefined') {
      window.location.assign('/login')
    }
  },
  hydrateSession: async () => {
    if (typeof window === 'undefined') {
      set({ user: null, isAuthenticated: false })
      return
    }

    const token = getCookie(ACCESS_TOKEN_KEY)

    if (!token) {
      clearSession(set)
      return
    }

    // Tenta recuperar user do storage primeiro (mais rápido)
    const storedUserRaw =
      localStorage.getItem(USER_STORAGE_KEY) ||
      sessionStorage.getItem(USER_STORAGE_KEY)

    if (storedUserRaw) {
      try {
        const user = JSON.parse(storedUserRaw) as User
        set({ user, isAuthenticated: true })
        return
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY)
        sessionStorage.removeItem(USER_STORAGE_KEY)
      }
    }

    // Storage vazio ou inválido: busca user na API usando o token
    const user = await getUserFromApi(token)

    if (user) {
      // Descobre onde guardar: se já havia no localStorage, usa local; senão, session
      const inLocal = !!localStorage.getItem(USER_STORAGE_KEY)
      if (inLocal) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      } else {
        sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
      }
    }

    set({ user, isAuthenticated: true })
  },
}))

setUnauthorizedHandler(() => {
  useAuthStore.getState().logout()
})

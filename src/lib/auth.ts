import { apiRequest } from './api'

export type AuthUser = {
  id: string
  email: string
  username?: string
  role: string
  status: string
}

type LoginResponse = {
  success: boolean
  accessToken: string
  tokenType: string
  expiresInMinutes: number
  idleTimeoutMinutes: number
  user: AuthUser
}

type RegisterResponse = {
  success: boolean
  id: string
  email: string
  username: string
  role: string
  status: string
}

const ACCESS_TOKEN_KEY = 'accessToken'
const USER_KEY = 'authUser'
const AUTH_FLAG_KEY = 'isAuthenticated'

function emitAuthChange() {
  window.dispatchEvent(new Event('auth-change'))
}

export function hasAccessToken() {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
}

export function storeSession(token: string, user: AuthUser) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(AUTH_FLAG_KEY, 'true')
  emitAuthChange()
}

export function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(AUTH_FLAG_KEY)
  emitAuthChange()
}

export async function login(email: string, password: string) {
  const response = await apiRequest<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  storeSession(response.accessToken, response.user)
  return response
}

export async function register(email: string, password: string) {
  return apiRequest<RegisterResponse>('/api/users/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function logout() {
  try {
    if (hasAccessToken()) {
      await apiRequest<{ success: boolean; message: string }>('/api/auth/logout', {
        method: 'POST',
      })
    }
  } finally {
    clearSession()
  }
}
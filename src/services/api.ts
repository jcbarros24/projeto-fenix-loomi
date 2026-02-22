import { getCookie } from '@/lib/cookies'

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  skipAuth?: boolean
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.status = status
    this.data = data
  }
}

let onUnauthorized: (() => void) | null = null

export const setUnauthorizedHandler = (handler: () => void) => {
  onUnauthorized = handler
}

const buildUrl = (path: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? ''

  if (!baseUrl) return path

  return new URL(path, baseUrl).toString()
}

const serializeBody = (body: unknown, headers: Headers) => {
  if (body === undefined || body === null) {
    return undefined
  }

  if (body instanceof FormData) {
    return body
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return JSON.stringify(body)
}

export const apiFetch = async <T>(path: string, options: ApiOptions = {}) => {
  const headers = new Headers(options.headers)

  if (!options.skipAuth) {
    const token = getCookie('access_token')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
    body: serializeBody(options.body, headers),
  })

  const contentType = response.headers.get('content-type') ?? ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (response.status === 401 && !options.skipAuth) {
    onUnauthorized?.()
  }

  if (!response.ok) {
    const friendlyMessage =
      response.status >= 500
        ? 'Erro interno. Tente novamente em instantes.'
        : 'Falha ao processar a requisicao.'

    throw new ApiError(friendlyMessage, response.status, data)
  }

  return data as T
}

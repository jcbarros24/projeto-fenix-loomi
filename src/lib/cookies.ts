type CookieOptions = {
  maxAgeDays?: number
  path?: string
  sameSite?: 'lax' | 'strict' | 'none'
}

const DEFAULT_OPTIONS: CookieOptions = {
  maxAgeDays: 7,
  path: '/',
  sameSite: 'lax',
}

export const getCookie = (name: string) => {
  if (typeof document === 'undefined') return null

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))

  if (!match) return null

  const value = match.split('=')[1]
  return value ? decodeURIComponent(value) : null
}

export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {},
) => {
  if (typeof document === 'undefined') return

  const { maxAgeDays, path, sameSite } = { ...DEFAULT_OPTIONS, ...options }
  const maxAge = maxAgeDays ? maxAgeDays * 24 * 60 * 60 : undefined

  const parts = [`${name}=${encodeURIComponent(value)}`]

  if (maxAge) {
    parts.push(`Max-Age=${maxAge}`)
  }

  if (path) {
    parts.push(`Path=${path}`)
  }

  if (sameSite) {
    parts.push(`SameSite=${sameSite}`)
  }

  document.cookie = parts.join('; ')
}

export const removeCookie = (name: string, path: string = '/') => {
  if (typeof document === 'undefined') return

  document.cookie = `${name}=; Max-Age=0; Path=${path}`
}

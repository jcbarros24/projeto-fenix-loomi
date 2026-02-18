import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/', '/cadastro', '/recuperar-senha']
const PROTECTED_PREFIXES = ['/dashboard', '/home', '/admin']

const isPublicPath = (pathname: string) => {
  if (PUBLIC_PATHS.includes(pathname)) return true

  return false
}

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  if (pathname === '/login' && token) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  if (isPublicPath(pathname) || !isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  if (!token) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}

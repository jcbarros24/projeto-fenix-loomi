import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/', '/login']
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/tickets',
  '/chat',
  '/simulator',
  '/profile',
]

const isProtectedPath = (pathname: string) =>
  PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  if ((pathname === '/' || pathname === '/login') && token) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  if (PUBLIC_PATHS.includes(pathname) || !isProtectedPath(pathname)) {
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
  matcher: [
    '/',
    '/login',
    '/dashboard',
    '/dashboard/:path*',
    '/tickets',
    '/tickets/:path*',
    '/chat',
    '/chat/:path*',
    '/simulator',
    '/simulator/:path*',
    '/profile',
    '/profile/:path*',
  ],
}

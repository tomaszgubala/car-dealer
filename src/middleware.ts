import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // /admin/login - zawsze przepuść
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Sprawdź czy jest cookie sesji NextAuth
  const sessionToken = 
    req.cookies.get('next-auth.session-token')?.value ||
    req.cookies.get('__Secure-next-auth.session-token')?.value ||
    req.cookies.get('authjs.session-token')?.value ||
    req.cookies.get('__Secure-authjs.session-token')?.value

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect /api/admin routes
  if (pathname.startsWith('/api/admin')) {
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}

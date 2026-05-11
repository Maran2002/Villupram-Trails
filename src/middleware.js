import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

// Routes requiring authentication
const AUTH_REQUIRED = ['/contribute', '/dashboard']
// Routes requiring admin role
const ADMIN_REQUIRED = ['/admin']
// Public routes that must never be redirected
const PUBLIC_ALWAYS = ['/auth/admin/vpm/login']

function parseJwt(token) {
  try {
    // Simple base64 decode of the payload (no crypto needed in Edge runtime)
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(atob(payload))
    // Check expiry
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null
    return decoded
  } catch {
    return null
  }
}

export function middleware(request) {
  const { pathname } = request.nextUrl

  // Always allow the hidden admin login page
  if (PUBLIC_ALWAYS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Get token from cookie or Authorization header
  const token =
    request.cookies.get('auth_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '')

  const user = token ? parseJwt(token) : null

  // Protect /admin routes — must be admin, redirect to admin login
  if (ADMIN_REQUIRED.some(p => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/admin/vpm/login', request.url))
    }
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Protect /contribute and /dashboard — must be logged in
  if (AUTH_REQUIRED.some(p => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login?from=' + encodeURIComponent(pathname), request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/contribute',
    '/dashboard/:path*',
    '/auth/admin/:path*',
  ],
}

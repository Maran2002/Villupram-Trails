import { NextResponse } from 'next/server'

const AUTH_REQUIRED = ['/contribute', '/dashboard']
const ADMIN_REQUIRED = ['/admin']
const PUBLIC_ALWAYS = ['/auth/admin/vpm/login']

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

async function verifyJwt(token) {
  try {
    const secret = process.env.JWT_SECRET
    if (!secret || secret.length < 32) return null

    const parts = token.split('.')
    if (parts.length !== 3) return null
    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])))
    if (header.alg !== 'HS256') return null

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    )
    if (!valid) return null

    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])))
    if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export async function proxy(request) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('origin')
    if (!origin || origin !== request.nextUrl.origin) {
      return NextResponse.json({ success: false, error: 'Invalid request origin' }, { status: 403 })
    }
  }

  if (PUBLIC_ALWAYS.some((path) => pathname.startsWith(path))) return NextResponse.next()

  const token = request.cookies.get('auth_token')?.value
  const user = token ? await verifyJwt(token) : null

  if (ADMIN_REQUIRED.some((path) => pathname.startsWith(path))) {
    if (!user) return NextResponse.redirect(new URL('/auth/admin/vpm/login', request.url))
    if (user.role !== 'admin' || user.adminSession !== true) {
      return NextResponse.redirect(new URL('/auth/admin/vpm/login', request.url))
    }
  }

  if (AUTH_REQUIRED.some((path) => pathname.startsWith(path)) && !user) {
    return NextResponse.redirect(new URL(`/auth/login?from=${encodeURIComponent(pathname)}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/contribute',
    '/dashboard/:path*',
    '/auth/admin/:path*',
    '/api/:path*',
  ],
}

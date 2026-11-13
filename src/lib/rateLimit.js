import { createHash } from 'node:crypto'
import { isIP } from 'node:net'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

const authRoutes = new Set([
  '/api/auth/login', '/api/auth/admin-login', '/api/auth/register',
  '/api/auth/forgot-password', '/api/auth/reset-password',
  '/api/auth/verify-email', '/api/auth/resend-verification',
])

const rules = {
  '/api/support': 10,
  '/api/reports': 15,
  '/api/newsletter': 10,
  '/api/visitor/log': 180,
  '/api/maps/static': 120,
  '/api/maps/reverse-geocode': 30,
  '/api/user/profile': 20,
  '/api/user/password': 10,
  '/api/places': 30,
  '/api/places/:placeId/reviews': 20,
}

export async function limitApiRequest(request) {
  const path = new URL(request.url).pathname.replace(/\/$/, '')
    .replace(/^\/api\/places\/[^/]+\/reviews$/, '/api/places/:placeId/reviews')
  const method = path === '/api/maps/static'
    ? 'GET'
    : ['/api/user/profile', '/api/user/password'].includes(path) ? 'PUT' : 'POST'
  if (request.method !== method) return null
  const limit = authRoutes.has(path) ? 20 : rules[path]
  if (!limit) return null

  const header = process.env.TRUSTED_CLIENT_IP_HEADER || (process.env.VERCEL ? 'x-vercel-forwarded-for' : '')
  const address = header ? request.headers.get(header)?.split(',')[0].trim() : ''
  const client = isIP(address || '') ? address : 'shared'
  const id = createHash('sha256').update(`${path}:${client}`).digest('hex')
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 60_000)
  const inWindow = { $gt: ['$expiresAt', now] }

  try {
    const db = await getDb()
    const counters = db.collection('api_rate_limits')
    const update = [{ $set: {
      count: { $cond: [inWindow, { $add: ['$count', 1] }, 1] },
      expiresAt: { $cond: [inWindow, '$expiresAt', expiresAt] },
    } }]
    let counter
    try {
      counter = await counters.findOneAndUpdate({ _id: id }, update, { upsert: true, returnDocument: 'after' })
    } catch (error) {
      if (error.code !== 11000) throw error
      counter = await counters.findOneAndUpdate({ _id: id }, update, { upsert: true, returnDocument: 'after' })
    }

    if (counter.count <= limit) return null
    const retryAfter = Math.max(1, Math.ceil((counter.expiresAt - now) / 1000))
    return NextResponse.json({ success: false, error: 'Too many requests. Try again shortly.' }, {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    })
  } catch (error) {
    console.error('API rate limiter unavailable', { path, code: error.code })
    return NextResponse.json({ success: false, error: 'Service temporarily unavailable' }, { status: 503 })
  }
}

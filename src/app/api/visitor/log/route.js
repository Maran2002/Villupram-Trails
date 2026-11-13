import { limitApiRequest } from '@/lib/rateLimit'
import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { buildVisitorLog } from '@/lib/schemas'

export async function POST(request) {
  const limited = await limitApiRequest(request)
  if (limited) return limited
  try {
    const body = await readJson(request, 4096)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Invalid tracking data' }, { status: 400 })
    }
    const path = typeof body?.path === 'string' ? body.path.split(/[?#]/, 1)[0] : ''
    const privatePrefixes = ['/admin', '/auth', '/contribute', '/dashboard']
    if (privatePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
      return NextResponse.json({ success: true, skipped: 'private-route' })
    }
    const db = await getDb()
    
    // Simple bot detection
    const ua = request.headers.get('user-agent') || ''
    if (/bot|spider|crawl|slurp|google|bing|yandex|duckduckbot/i.test(ua)) {
      return NextResponse.json({ success: true, skipped: 'bot' })
    }

    const doc = buildVisitorLog(body)
    await db.collection('visitor_logs').insertOne(doc)

    return NextResponse.json({ success: true })
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    console.error('Tracking error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

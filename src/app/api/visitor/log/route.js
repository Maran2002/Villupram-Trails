import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { buildVisitorLog } from '@/lib/schemas'

export async function POST(request) {
  try {
    const body = await request.json()
    const db = await getDb()
    
    // Simple bot detection
    const ua = body.userAgent || ''
    if (/bot|spider|crawl|slurp|google|bing|yandex|duckduckbot/i.test(ua)) {
      return NextResponse.json({ success: true, skipped: 'bot' })
    }

    const doc = buildVisitorLog(body)
    await db.collection('visitor_logs').insertOne(doc)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getAuthUser, unauthorized, forbidden } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { getDb } from '@/lib/mongodb'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'newsletter', 'view')) return forbidden()

    const { searchParams } = new URL(request.url)
    const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10)
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '20', 10)
    const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1
    const limit = Number.isFinite(requestedLimit) ? Math.min(50, Math.max(1, requestedLimit)) : 20
    const search = (searchParams.get('search') || '').trim().slice(0, 100)
    const query = search
      ? { email: { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
      : {}

    const db = await getDb()
    const collection = db.collection('newsletter_subscribers')
    const [subscribers, total] = await Promise.all([
      collection.find(query, { projection: { email: 1, subscribedAt: 1, status: 1 } })
        .sort({ subscribedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      collection.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: subscribers.map(({ _id, email, subscribedAt, status }) => ({
        id: _id.toString(), email, subscribedAt, status,
      })),
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Fetch newsletter subscribers error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch newsletter emails' }, { status: 500 })
  }
}

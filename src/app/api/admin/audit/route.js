import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden } from '@/lib/auth'

// GET /api/admin/audit — admin only
export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (user.role !== 'admin') return forbidden()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const action = searchParams.get('action')
    const target = searchParams.get('target')

    const db = await getDb()
    const query = {}
    if (action) query.action = { $regex: action, $options: 'i' }
    if (target) query.target = target

    const logs = await db.collection('audit_logs')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    const total = await db.collection('audit_logs').countDocuments(query)

    return NextResponse.json({ success: true, data: { logs, total, page, pages: Math.ceil(total / limit) } })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs' }, { status: 500 })
  }
}

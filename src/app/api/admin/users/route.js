import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden } from '@/lib/auth'

// GET /api/admin/users — admin only, paginated, searchable
export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (user.role !== 'admin') return forbidden()

    const { searchParams } = new URL(request.url)
    const page   = Math.max(1, parseInt(searchParams.get('page'))  || 1)
    const limit  = Math.min(100, parseInt(searchParams.get('limit')) || 20)
    const search = searchParams.get('search')
    const role   = searchParams.get('role')  // 'user' | 'admin'

    const db    = await getDb()
    const query = {}
    if (search) query.$or = [
      { username: { $regex: search, $options: 'i' } },
      { email:    { $regex: search, $options: 'i' } },
    ]
    if (role === 'user' || role === 'admin') query.role = role

    const [users, total] = await Promise.all([
      db.collection('users')
        .find(query, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection('users').countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: { users, total, page, pages: Math.ceil(total / limit) }
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 })
  }
}

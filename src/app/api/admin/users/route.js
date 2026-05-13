import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden, hasPermission, writeAudit } from '@/lib/auth'
import { buildUserDoc } from '@/lib/schemas'
import bcrypt from 'bcryptjs'

// GET /api/admin/users — admin only, paginated, searchable
export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'users', 'view')) return forbidden()

    const { searchParams } = new URL(request.url)
    const page   = Math.max(1, parseInt(searchParams.get('page'))  || 1)
    const limit  = Math.min(100, parseInt(searchParams.get('limit')) || 20)
    const search = searchParams.get('search')
    const role   = searchParams.get('role')  // 'user' | 'admin'

    const db    = await getDb()
    const query = { _id: { $ne: user._id } } // Filter out the currently logged-in admin

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

// POST /api/admin/users — create a new user or admin
export async function POST(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'users', 'add')) return forbidden()

    const body = await request.json()
    const { email, password, username, role, permissions } = body

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 422 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const { doc, errors } = buildUserDoc({ email, username, hashedPassword, role, permissions })

    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join('; ') }, { status: 422 })
    }

    const db = await getDb()
    const existing = await db.collection('users').findOne({
      $or: [{ email: doc.email }, { username: doc.username }]
    })
    
    if (existing) {
      return NextResponse.json({ success: false, error: 'Email or username already taken' }, { status: 409 })
    }

    const result = await db.collection('users').insertOne(doc)

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'user.create', target: 'user', targetId: result.insertedId,
      meta: { newRole: doc.role }
    })

    const { password: _, ...safe } = doc
    return NextResponse.json({ success: true, data: { ...safe, _id: result.insertedId } }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
const ADMIN_TOKEN = process.env.ADMIN_ACCESS_TOKEN

export async function POST(request) {
  try {
    const { username, password, accessToken } = await request.json()

    // First gate — static access token must match
    if (!accessToken || accessToken !== ADMIN_TOKEN) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const db = await getDb()

    // Look up by username (not email) — admin-specific auth
    const user = await db.collection('users').findOne({ username })
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    // Must actually be an admin
    if (user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Access denied — not an admin account' }, { status: 403 })
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({ success: true, data: { token, user: userWithoutPassword } })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 })
  }
}

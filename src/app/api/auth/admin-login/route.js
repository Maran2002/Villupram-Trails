import { limitApiRequest } from '@/lib/rateLimit'
import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/permissions'

const ADMIN_TOKEN = process.env.ADMIN_ACCESS_TOKEN

export async function POST(request) {
  const limited = await limitApiRequest(request)
  if (limited) return limited
  try {
    const { username, password, accessToken } = await readJson(request)
    const jwtSecret = getJwtSecret()

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
      { userId: user._id, email: user.email, role: 'admin', adminSession: true, sessionVersion: user.sessionVersion || 0 },
      jwtSecret,
      { expiresIn: '1h' }
    )

    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      success: true,
      data: { user: { ...userWithoutPassword, isSuperAdmin: isSuperAdmin(user) } },
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 })
  }
}

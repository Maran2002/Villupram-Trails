import { limitApiRequest } from '@/lib/rateLimit'
import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/permissions'

export async function POST(request) {
  const limited = await limitApiRequest(request)
  if (limited) return limited
  try {
    const { email, password } = await readJson(request)
    const jwtSecret = getJwtSecret()
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 })
    }
    const db = await getDb()

    const user = await db.collection('users').findOne({ email: email.trim().toLowerCase() })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.role === 'admin') {
      return NextResponse.json({ success: false, error: 'Administrators must use the admin sign-in page' }, { status: 403 })
    }

    if (user.isVerified === false) {
      return NextResponse.json({ success: false, error: 'Verify your email before signing in', code: 'EMAIL_NOT_VERIFIED' }, { status: 403 })
    }

    // Include role in JWT payload so middleware can read it without a DB call
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role || 'user', sessionVersion: user.sessionVersion || 0 },
      jwtSecret,
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({
      success: true,
      data: { user: { ...userWithoutPassword, isSuperAdmin: isSuperAdmin(user) } },
    })

    // Set HttpOnly cookie so the Edge middleware can read it
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    return NextResponse.json({ success: false, error: 'Failed to login' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    const db = await getDb()

    const user = await db.collection('users').findOne({ email })
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    // Include role in JWT payload so middleware can read it without a DB call
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role || 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json({ success: true, data: { token, user: userWithoutPassword } })

    // Set HttpOnly cookie so the Edge middleware can read it
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to login' }, { status: 500 })
  }
}

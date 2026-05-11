import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { buildUserDoc } from '@/lib/schemas'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

export async function POST(request) {
  try {
    const { email, password, username } = await request.json()

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 422 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const { doc, errors } = buildUserDoc({ email, username, hashedPassword })

    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join('; ') }, { status: 422 })
    }

    const db = await getDb()
    const existing = await db.collection('users').findOne({
      $or: [{ email: doc.email }, { username: doc.username }]
    })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email or username already taken' },
        { status: 409 }
      )
    }

    const result = await db.collection('users').insertOne(doc)

    const token = jwt.sign(
      { userId: result.insertedId, email: doc.email, role: doc.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const { password: _, ...safe } = doc

    const response = NextResponse.json(
      { success: true, data: { token, user: { ...safe, _id: result.insertedId } } },
      { status: 201 }
    )
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to register' }, { status: 500 })
  }
}

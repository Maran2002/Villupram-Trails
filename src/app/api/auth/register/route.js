import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import { buildUserDoc } from '@/lib/schemas'
import { issueOtp, normalizeEmail, publicOtpError } from '@/lib/emailOtp'

export async function POST(request) {
  try {
    const { email, password, username } = await request.json()

    if (typeof password !== 'string' || password.length < 12) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 12 characters' },
        { status: 422 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const { doc, errors } = buildUserDoc({ email: normalizeEmail(email), username, hashedPassword, isVerified: false })

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
    const otpResult = await issueOtp({ db, user: { ...doc, _id: result.insertedId }, purpose: 'email_verification', force: true })
    if (!otpResult.ok) {
      return NextResponse.json({ success: false, error: publicOtpError(otpResult), accountCreated: true }, { status: 503 })
    }

    return NextResponse.json({
      success: true,
      data: { email: doc.email, message: 'Enter the verification code sent to your email.' },
    }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to register' }, { status: 500 })
  }
}

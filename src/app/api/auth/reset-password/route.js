import { limitApiRequest } from '@/lib/rateLimit'
import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import { normalizeEmail, validOtp, verifyOtp } from '@/lib/emailOtp'

export async function POST(request) {
  const limited = await limitApiRequest(request)
  if (limited) return limited
  try {
    const { email, code, password } = await readJson(request)
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail || !validOtp(code) || typeof password !== 'string' || password.length < 12) {
      return NextResponse.json({ success: false, error: 'Enter a valid email, six digit code, and password of at least 12 characters' }, { status: 400 })
    }
    const db = await getDb()
    const user = await db.collection('users').findOne({ email: normalizedEmail })
    if (!user) return NextResponse.json({ success: false, error: 'Invalid or expired reset code' }, { status: 400 })

    const result = await verifyOtp({ db, user, purpose: 'password_reset', code })
    if (!result.ok) return NextResponse.json({ success: false, error: 'Invalid or expired reset code' }, { status: 400 })

    const hashedPassword = await bcrypt.hash(password, 10)
    const updated = await db.collection('users').updateOne(
      { _id: user._id, email: normalizedEmail, password: user.password },
      { $set: { password: hashedPassword, updatedAt: new Date() }, $inc: { sessionVersion: 1 } }
    )
    if (!updated.matchedCount) return NextResponse.json({ success: false, error: 'Account changed. Request a new code.' }, { status: 409 })
    return NextResponse.json({ success: true, data: { message: 'Password updated. You can now sign in.' } })
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    return NextResponse.json({ success: false, error: 'Unable to reset password right now' }, { status: 500 })
  }
}

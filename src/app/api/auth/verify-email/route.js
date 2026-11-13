import { limitApiRequest } from '@/lib/rateLimit'
import { hasVerifiedEmail } from '@/lib/emailVerification'
import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { normalizeEmail, validOtp, verifyOtp } from '@/lib/emailOtp'

export async function POST(request) {
  const limited = await limitApiRequest(request)
  if (limited) return limited
  try {
    const { email, code } = await readJson(request)
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail || !validOtp(code)) {
      return NextResponse.json({ success: false, error: 'Enter a valid email and six digit code' }, { status: 400 })
    }
    const db = await getDb()
    const user = await db.collection('users').findOne({ email: normalizedEmail })
    if (!user) return NextResponse.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 })
    if (hasVerifiedEmail(user)) return NextResponse.json({ success: true, data: { message: 'Email is already verified.' } })

    const result = await verifyOtp({ db, user, purpose: 'email_verification', code })
    if (!result.ok) return NextResponse.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 })
    const now = new Date()
    const updated = await db.collection('users').updateOne(
      { _id: user._id, email: normalizedEmail },
      { $set: { isVerified: true, verifiedEmail: normalizedEmail, emailVerifiedAt: now, updatedAt: now } }
    )
    if (!updated.matchedCount) return NextResponse.json({ success: false, error: 'Account changed. Request a new code.' }, { status: 409 })
    return NextResponse.json({ success: true, data: { message: 'Email verified. You can now sign in.' } })
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    return NextResponse.json({ success: false, error: 'Unable to verify email right now' }, { status: 500 })
  }
}

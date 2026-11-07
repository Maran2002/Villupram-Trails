import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { normalizeEmail, validOtp, verifyOtp } from '@/lib/emailOtp'

export async function POST(request) {
  try {
    const { email, code } = await request.json()
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail || !validOtp(code)) {
      return NextResponse.json({ success: false, error: 'Enter a valid email and six digit code' }, { status: 400 })
    }
    const db = await getDb()
    const user = await db.collection('users').findOne({ email: normalizedEmail })
    if (!user) return NextResponse.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 })
    if (user.isVerified === true) return NextResponse.json({ success: true, data: { message: 'Email is already verified.' } })

    const result = await verifyOtp({ db, user, purpose: 'email_verification', code })
    if (!result.ok) return NextResponse.json({ success: false, error: 'Invalid or expired verification code' }, { status: 400 })
    await db.collection('users').updateOne({ _id: user._id, isVerified: { $ne: true } }, { $set: { isVerified: true, emailVerifiedAt: new Date(), updatedAt: new Date() } })
    return NextResponse.json({ success: true, data: { message: 'Email verified. You can now sign in.' } })
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to verify email right now' }, { status: 500 })
  }
}

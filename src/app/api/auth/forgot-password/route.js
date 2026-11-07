import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { issueOtp, normalizeEmail } from '@/lib/emailOtp'

export async function POST(request) {
  const generic = { success: true, data: { message: 'If an account exists for that email, a reset code will be sent shortly.' } }
  try {
    const { email } = await request.json()
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) return NextResponse.json(generic)
    const db = await getDb()
    const user = await db.collection('users').findOne({ email: normalizedEmail })
    if (user) await issueOtp({ db, user, purpose: 'password_reset' })
    return NextResponse.json(generic)
  } catch {
    return NextResponse.json(generic)
  }
}

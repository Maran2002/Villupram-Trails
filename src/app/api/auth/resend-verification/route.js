import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { issueOtp, normalizeEmail } from '@/lib/emailOtp'

export async function POST(request) {
  const generic = { success: true, data: { message: 'If the account needs verification, a code will be sent shortly.' } }
  try {
    const { email } = await request.json()
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) return NextResponse.json(generic)
    const db = await getDb()
    const user = await db.collection('users').findOne({ email: normalizedEmail, isVerified: { $ne: true }, role: { $ne: 'admin' } })
    if (user) await issueOtp({ db, user, purpose: 'email_verification' })
    return NextResponse.json(generic)
  } catch {
    return NextResponse.json(generic)
  }
}

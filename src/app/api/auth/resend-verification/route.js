import { limitApiRequest } from '@/lib/rateLimit'
import { hasVerifiedEmail } from '@/lib/emailVerification'
import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { issueOtp, normalizeEmail } from '@/lib/emailOtp'

export async function POST(request) {
  const limited = await limitApiRequest(request)
  if (limited) return limited
  const generic = { success: true, data: { message: 'If the account needs verification, a code will be sent shortly.' } }
  try {
    const { email } = await readJson(request)
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) return NextResponse.json(generic)
    const db = await getDb()
    const user = await db.collection('users').findOne({ email: normalizedEmail, role: { $ne: 'admin' } })
    if (user && !hasVerifiedEmail(user)) await issueOtp({ db, user, purpose: 'email_verification' })
    return NextResponse.json(generic)
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    return NextResponse.json(generic)
  }
}

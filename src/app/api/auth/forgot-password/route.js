import { limitApiRequest } from '@/lib/rateLimit'
import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { issueOtp, normalizeEmail } from '@/lib/emailOtp'

export async function POST(request) {
  const limited = await limitApiRequest(request)
  if (limited) return limited
  const generic = { success: true, data: { message: 'If an account exists for that email, a reset code will be sent shortly.' } }
  try {
    const { email } = await readJson(request)
    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) return NextResponse.json(generic)
    const db = await getDb()
    const user = await db.collection('users').findOne({ email: normalizedEmail })
    if (user) await issueOtp({ db, user, purpose: 'password_reset' })
    return NextResponse.json(generic)
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    return NextResponse.json(generic)
  }
}

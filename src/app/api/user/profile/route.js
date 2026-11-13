import { limitApiRequest } from '@/lib/rateLimit'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import clientPromise, { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, writeAudit } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/permissions'
import { issueOtp, normalizeEmail, publicOtpError, validOtp, verifyOtp } from '@/lib/emailOtp'
import { hasVerifiedEmail } from '@/lib/emailVerification'
import { buildUserPatch, filterImages } from '@/lib/schemas'
import { readJson, requestBodyError } from '@/lib/requestJson'

const EMAIL_CHANGE = 'email_change'

function failure(error, status) {
  return NextResponse.json({ success: false, error }, { status })
}

export async function PUT(request) {
  const limited = await limitApiRequest(request)
  if (limited) return limited
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const body = await readJson(request, 1536 * 1024)
    const email = body.email === undefined ? user.email : normalizeEmail(body.email)
    const fields = {}
    if (body.email !== undefined) fields.email = email
    if (body.username !== undefined) fields.username = body.username
    const { patch, errors } = buildUserPatch(fields)
    if (errors.length) return failure(errors.join('. '), 422)
    delete patch.email

    for (const [field, max] of [['bio', 1000], ['location', 160]]) {
      if (!Object.hasOwn(body, field)) continue
      if (typeof body[field] !== 'string' || body[field].length > max) {
        return failure(`${field} must be text of at most ${max} characters`, 422)
      }
      patch[field] = body[field].trim()
    }
    if (body.profileImage !== undefined && body.profileImage !== user.profileImage) {
      if (body.profileImage !== '' && !filterImages([body.profileImage]).length) {
        return failure('Use an HTTPS image URL or a PNG, JPEG, or WebP image up to 1 MB', 422)
      }
      patch.profileImage = body.profileImage
    }

    const db = await getDb()
    const users = db.collection('users')
    if (patch.username && patch.username !== user.username &&
        await users.findOne({ username: patch.username, _id: { $ne: user._id } })) {
      return failure('Username already taken', 409)
    }

    const needsVerification = email !== user.email || body.sendEmailCode === true || body.emailCode !== undefined
    const account = { _id: user._id, email: user.email, sessionVersion: user.sessionVersion ?? { $in: [null, 0] } }
    let result

    if (needsVerification) {
      const { currentPassword, emailCode, sendEmailCode } = body
      if (typeof currentPassword !== 'string' || !currentPassword || currentPassword.length > 1024) {
        return failure('Enter your current password to verify this email', 422)
      }
      const credential = await users.findOne(account, { projection: { password: 1 } })
      if (!credential || !(await bcrypt.compare(currentPassword, credential.password))) {
        return failure('Current password is incorrect', 403)
      }
      account.password = credential.password

      if (email !== user.email && await users.findOne({ email, _id: { $ne: user._id } })) {
        return failure('Email already registered', 409)
      }
      if (sendEmailCode === true) {
        const sent = await issueOtp({ db, user, email, purpose: EMAIL_CHANGE })
        if (!sent.ok) return failure(publicOtpError(sent), sent.deliveryFailed ? 503 : 429)
        return NextResponse.json({ success: true, data: { emailCodeSent: true } })
      }
      if (!validOtp(emailCode)) return failure('Enter the six-digit code sent to this email', 422)

      const client = await clientPromise
      const session = client.startSession()
      try {
        result = await session.withTransaction(async () => {
          const verified = await verifyOtp({ db, user, email, purpose: EMAIL_CHANGE, code: emailCode, session })
          if (!verified.ok) return null
          const now = new Date()
          const updated = await users.findOneAndUpdate(account, {
            $set: { ...patch, email, isVerified: true, verifiedEmail: email, emailVerifiedAt: now, updatedAt: now },
          }, { session, returnDocument: 'after', projection: { password: 0 } })
          if (!updated) throw new Error('Account changed during verification')
          return updated
        })
      } finally {
        await session.endSession()
      }
      if (!result) return failure('Invalid or expired verification code', 422)
    } else {
      result = await users.findOneAndUpdate(account, {
        $set: { ...patch, ...(hasVerifiedEmail(user) ? { verifiedEmail: user.email } : {}), updatedAt: new Date() },
      }, { returnDocument: 'after', projection: { password: 0 } })
      if (!result) return failure('Account changed. Reload and try again.', 409)
    }

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'user.update_profile', target: 'user', targetId: user._id.toString(),
      meta: { fields: Object.keys(patch), emailVerified: needsVerification },
    })

    return NextResponse.json({ success: true, data: { ...result, isSuperAdmin: isSuperAdmin(result) } })
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    if (error.code === 11000) return failure('Email or username already taken', 409)
    console.error('Profile update failed', { code: error.code })
    return failure('Failed to update profile', 500)
  }
}

export async function GET(request) {
  const user = await getAuthUser(request)
  if (!user) return unauthorized()
  return NextResponse.json({ success: true, data: { ...user, isSuperAdmin: isSuperAdmin(user) } })
}

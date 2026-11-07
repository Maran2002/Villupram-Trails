import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'
import { getJwtSecret } from '@/lib/auth'
import { sendOtpEmail } from '@/lib/brevo'

export const OTP_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const SEND_WINDOW_MS = 24 * 60 * 60 * 1000
const MAX_SENDS_PER_WINDOW = 5
const MAX_ATTEMPTS = 5

function otpDigest(userId, purpose, code) {
  const secret = process.env.EMAIL_OTP_SECRET || getJwtSecret()
  return createHmac('sha256', secret).update(`${userId}:${purpose}:${code}`).digest('hex')
}

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

export function validOtp(code) {
  return typeof code === 'string' && /^\d{6}$/.test(code)
}

export async function issueOtp({ db, user, purpose, force = false }) {
  const collection = db.collection('email_verifications')
  const now = new Date()
  const existing = await collection.findOne({ userId: user._id, purpose })
  const sentAt = existing?.sentAt?.getTime?.() || 0
  const windowStart = existing?.windowStartedAt?.getTime?.() || 0
  const sendCount = windowStart && now.getTime() - windowStart < SEND_WINDOW_MS
    ? (existing?.sendCount || 0)
    : 0

  if (!force && sentAt && now.getTime() - sentAt < RESEND_COOLDOWN_MS) {
    return { ok: false, retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - (now.getTime() - sentAt)) / 1000) }
  }
  if (sendCount >= MAX_SENDS_PER_WINDOW) return { ok: false, rateLimited: true }

  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const nextCount = sendCount + 1
  const windowStartedAt = sendCount ? existing.windowStartedAt : now
  const codeExpiresAt = new Date(now.getTime() + OTP_TTL_MS)
  const expiresAt = new Date(windowStartedAt.getTime() + SEND_WINDOW_MS)
  await collection.updateOne(
    { userId: user._id, purpose },
    { $set: {
      userId: user._id, email: user.email, purpose,
      codeHash: otpDigest(user._id.toString(), purpose, code),
      attempts: 0, sentAt: now, windowStartedAt, sendCount: nextCount, codeExpiresAt, expiresAt,
    } },
    { upsert: true }
  )

  try {
    await sendOtpEmail({ email: user.email, code, purpose })
    return { ok: true }
  } catch (error) {
    // Invalidate the code if delivery fails; keep a non-sensitive diagnostic server-side.
    await collection.deleteOne({ userId: user._id, purpose, sentAt: now })
    console.error('OTP email delivery failed', { purpose, error: error?.message || 'unknown error' })
    return { ok: false, deliveryFailed: true }
  }
}

export async function verifyOtp({ db, user, purpose, code }) {
  const collection = db.collection('email_verifications')
  const record = await collection.findOne({ userId: user._id, purpose })
  if (!record || !record.codeExpiresAt || record.codeExpiresAt <= new Date()) return { ok: false, reason: 'expired' }
  if (record.attempts >= MAX_ATTEMPTS) return { ok: false, reason: 'locked' }

  const expected = Buffer.from(record.codeHash || '', 'hex')
  const actual = Buffer.from(otpDigest(user._id.toString(), purpose, code), 'hex')
  const matches = expected.length === actual.length && timingSafeEqual(expected, actual)
  if (!matches) {
    await collection.updateOne(
      { _id: record._id, attempts: { $lt: MAX_ATTEMPTS }, codeExpiresAt: { $gt: new Date() } },
      { $inc: { attempts: 1 } }
    )
    return { ok: false, reason: 'invalid' }
  }
  // Keep the send-window counters so a completed reset cannot immediately
  // reset its delivery quota. Atomically consume the code to prevent replay.
  const consumed = await collection.updateOne(
    { _id: record._id, codeHash: record.codeHash, attempts: { $lt: MAX_ATTEMPTS }, codeExpiresAt: { $gt: new Date() } },
    { $set: { codeHash: '', consumedAt: new Date(), codeExpiresAt: new Date() } }
  )
  return consumed.modifiedCount === 1 ? { ok: true } : { ok: false, reason: 'expired' }
}

export function publicOtpError(result) {
  if (result.deliveryFailed) return 'Email delivery is temporarily unavailable. Please try again later.'
  if (result.rateLimited) return 'Too many codes requested. Please try again later.'
  if (result.retryAfterSeconds) return `Please wait ${result.retryAfterSeconds} seconds before requesting another code.`
  return 'Unable to send the verification code. Please try again later.'
}


import jwt from 'jsonwebtoken'
import { getDb } from './mongodb'
import { ObjectId } from 'mongodb'

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be configured with at least 32 characters')
  }
  return secret
}

/**
 * Verify the HttpOnly session cookie and return the decoded user claims.
 * Returns null if missing/invalid.
 */
export function verifyToken(request) {
  const cookieToken = request.cookies?.get?.('auth_token')?.value
    || request.headers.get('cookie')?.match(/(?:^|;\s*)auth_token=([^;]+)/)?.[1]
  if (!cookieToken) return null
  try {
    return jwt.verify(decodeURIComponent(cookieToken), getJwtSecret())
  } catch {
    return null
  }
}

/**
 * Full user lookup from DB using the decoded token.
 * Returns user doc (without password) or null.
 */
export async function getAuthUser(request) {
  const decoded = verifyToken(request)
  if (!decoded) return null
  try {
    const db = await getDb()
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(decoded.userId) },
      { projection: { password: 0 } }
    )
    if (user?.role === 'admin' && decoded.adminSession !== true) return null
    if (user && Number(decoded.sessionVersion || 0) !== Number(user.sessionVersion || 0)) return null
    return user || null
  } catch {
    return null
  }
}

/** Shared 401 response */
export function unauthorized(msg = 'Authentication required') {
  const { NextResponse } = require('next/server')
  return NextResponse.json({ success: false, error: msg }, { status: 401 })
}

/** Shared 403 response */
export function forbidden(msg = 'Access denied') {
  const { NextResponse } = require('next/server')
  return NextResponse.json({ success: false, error: msg }, { status: 403 })
}

/**
 * Write an audit log entry.
 */
export async function writeAudit({ userId, username, role, action, target, targetId, meta = {} }) {
  try {
    const db = await getDb()
    await db.collection('audit_logs').insertOne({
      userId: userId ? new ObjectId(userId) : null,
      username,
      role,
      action,      // e.g. 'place.create', 'review.delete', 'place.approve'
      target,      // 'place' | 'review' | 'user'
      targetId: targetId ? targetId.toString() : null,
      meta,
      createdAt: new Date(),
    })
  } catch (error) {
    console.error('Audit write failed', { action, target, code: error.code })
  }
}

// Re-exported from permissions.js for backward compatibility with routes that import from auth
export { hasPermission, SUPERADMIN_ID, isSuperAdmin } from './permissions'

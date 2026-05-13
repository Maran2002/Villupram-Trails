import jwt from 'jsonwebtoken'
import { getDb } from './mongodb'
import { ObjectId } from 'mongodb'
import { hasPermission, SUPERADMIN_ID } from './permissions'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

/**
 * Verify JWT from Authorization header and return { userId, email, role }.
 * Returns null if missing/invalid.
 */
export function verifyToken(request) {
  try {
    const auth = request.headers.get('authorization') || ''
    if (!auth.startsWith('Bearer ')) return null
    const token = auth.slice(7)
    return jwt.verify(token, JWT_SECRET)
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
  } catch {
    // Never let audit failure break the main flow
  }
}

// Re-exported from permissions.js for backward compatibility with routes that import from auth
export { hasPermission, SUPERADMIN_ID }

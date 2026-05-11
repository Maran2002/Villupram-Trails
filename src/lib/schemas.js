/**
 * src/lib/schemas.js
 * ─────────────────────────────────────────────────────────────
 * Shared document-shape builders + validators for MongoDB.
 * No Mongoose — pure driver project. These functions sanitise
 * and normalise inputs before they touch the database.
 */

import { ObjectId } from 'mongodb'

/* ─── Constants ─────────────────────────────────────────────── */
export const VALID_CATEGORIES    = ['Heritage', 'Nature', 'Temple', 'Food', 'Beach', 'Adventure', 'Other']
export const VALID_SUBCATEGORIES = ['Fortress', 'Palace', 'Waterfall', 'Wildlife', 'Religious', 'Dam', 'Museum', 'Other']
export const VALID_DAYS          = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const VALID_STATUSES      = ['Pending', 'Approved', 'Rejected', 'Draft']
export const VALID_AMENITIES     = ['wheelchair', 'parking', 'restrooms', 'photography', 'guided']

/* ─── Helpers ───────────────────────────────────────────────── */
function str(v, fallback = '')      { return typeof v === 'string' ? v.trim() : fallback }
function float(v)                   { const n = parseFloat(v); return isNaN(n) ? undefined : n }
function clamp(v, min, max)         { return Math.min(Math.max(Number(v) || 0, min), max) }
function filterArr(arr, valid)      { return Array.isArray(arr) ? arr.filter(i => valid.includes(i)) : [] }

/** Sanitise the visitingHoursMeta sub-document */
function visitingHoursMeta(raw) {
  if (!raw || typeof raw !== 'object') return { startTime: '', endTime: '', days: [] }
  return {
    startTime : str(raw.startTime),
    endTime   : str(raw.endTime),
    days      : filterArr(raw.days, VALID_DAYS),
  }
}

/** Build the visitingHours human-readable string from meta */
export function formatVisitingHours(meta) {
  if (!meta) return ''
  const parts = []
  if (meta.startTime && meta.endTime) parts.push(`${meta.startTime} – ${meta.endTime}`)
  if (Array.isArray(meta.days) && meta.days.length) parts.push(meta.days.join(', '))
  return parts.join(' | ')
}

/** Validate a geographic coordinate pair — returns { lat, lng } or null */
function coords(lat, lng) {
  const la = float(lat), ln = float(lng)
  if (la === undefined || ln === undefined) return undefined
  if (la < -90 || la > 90 || ln < -180 || ln > 180) return undefined
  return { lat: la, lng: ln }
}

/* ─── Place schema ──────────────────────────────────────────── */

/**
 * Build a new place document for insertion.
 * Returns { doc, errors } — errors is an array of strings.
 */
export function buildPlaceDoc(body, submitter, forceStatus) {
  const errors = []

  const name = str(body.name)
  if (!name) errors.push('name is required')

  const category = str(body.category)
  if (!category) errors.push('category is required')
  else if (!VALID_CATEGORIES.includes(category)) errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`)

  const subCategory = str(body.subCategory)
  if (subCategory && !VALID_SUBCATEGORIES.includes(subCategory)) errors.push(`subCategory must be one of: ${VALID_SUBCATEGORIES.join(', ')}`)

  const description = str(body.description)
  if (!description) errors.push('description is required')

  // Location
  const address    = str(body.location?.address || body.address)
  const latLng     = coords(body.location?.lat ?? body.latitude, body.location?.lng ?? body.longitude)
  const location   = { address, ...(latLng || {}) }

  // Visiting hours
  const meta       = visitingHoursMeta(body.visitingHoursMeta || body.visitingHours_meta)
  const hoursStr   = str(body.visitingHours) || formatVisitingHours(meta)

  // Entry fee — store raw string, strip dangerous chars
  const entryFee   = str(body.entryFee).replace(/[<>]/g, '').slice(0, 200)

  // Amenities
  const amenities  = filterArr(body.amenities, VALID_AMENITIES)

  // Images — accept http(s) URLs and base64 data URIs, max 10
  const images     = (Array.isArray(body.images) ? body.images : [])
    .filter(u => typeof u === 'string' && (u.startsWith('http') || u.startsWith('data:image/')))
    .slice(0, 10)

  // Status
  const statusInput = str(body.status)
  const status = forceStatus
    || (VALID_STATUSES.includes(statusInput) ? statusInput : 'Pending')

  const doc = {
    name, category,
    ...(subCategory ? { subCategory } : {}),
    description,
    fullDescription : str(body.fullDescription) || description,
    location,
    visitingHours   : hoursStr,
    visitingHoursMeta: meta,
    entryFee,
    amenities,
    images,
    status,
    rating      : 0,
    reviewCount : 0,
    ...(submitter ? { submittedBy: { userId: submitter._id, username: submitter.username } } : {}),
    createdAt   : new Date(),
    updatedAt   : new Date(),
  }

  return { doc, errors }
}

/**
 * Build an update patch for PUT requests.
 * Only includes fields that are explicitly provided in `body`.
 */
export function buildPlacePatch(body, { isAdmin } = {}) {
  const patch = {}
  const errors = []

  if ('name' in body) {
    const v = str(body.name); if (!v) errors.push('name cannot be empty'); else patch.name = v
  }
  if ('category' in body) {
    const v = str(body.category)
    if (!VALID_CATEGORIES.includes(v)) errors.push('invalid category'); else patch.category = v
  }
  if ('subCategory' in body) {
    const v = str(body.subCategory)
    if (v && !VALID_SUBCATEGORIES.includes(v)) errors.push('invalid subCategory'); else patch.subCategory = v
  }
  if ('description' in body)      patch.description = str(body.description)
  if ('fullDescription' in body)  patch.fullDescription = str(body.fullDescription)
  if ('entryFee' in body)         patch.entryFee = str(body.entryFee).replace(/[<>]/g, '').slice(0, 200)
  if ('amenities' in body)        patch.amenities = filterArr(body.amenities, VALID_AMENITIES)
  if ('images' in body)           patch.images = (body.images || []).filter(u => typeof u === 'string' && (u.startsWith('http') || u.startsWith('data:image/'))).slice(0, 10)

  if ('visitingHoursMeta' in body || 'visitingHours_meta' in body) {
    const meta = visitingHoursMeta(body.visitingHoursMeta || body.visitingHours_meta)
    patch.visitingHoursMeta = meta
    patch.visitingHours = str(body.visitingHours) || formatVisitingHours(meta)
  } else if ('visitingHours' in body) {
    patch.visitingHours = str(body.visitingHours)
  }

  if ('location' in body || 'address' in body || 'latitude' in body) {
    const address = str(body.location?.address || body.address)
    const latLng  = coords(body.location?.lat ?? body.latitude, body.location?.lng ?? body.longitude)
    patch.location = { address, ...(latLng || {}) }
  }

  // Only admins can directly set status
  if (isAdmin && 'status' in body) {
    const s = str(body.status)
    if (VALID_STATUSES.includes(s)) patch.status = s
  }

  patch.updatedAt = new Date()
  return { patch, errors }
}

/* ─── Review schema ─────────────────────────────────────────── */

export function buildReviewDoc(body, user, placeObjectId) {
  const errors = []

  const comment = str(body.comment)
  if (!comment) errors.push('comment is required')
  if (comment.length > 2000) errors.push('comment must be under 2000 characters')

  const rating = clamp(body.rating ?? 5, 1, 5)

  const doc = {
    placeId   : placeObjectId,
    rating,
    comment   : comment.slice(0, 2000),
    author    : user.username,
    userId    : user._id,
    visible   : true,
    createdAt : new Date(),
  }

  return { doc, errors }
}

/* ─── User schema ───────────────────────────────────────────── */

export function buildUserDoc({ email, username, hashedPassword }) {
  const errors = []
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('invalid email')
  if (!username || username.length < 3) errors.push('username must be at least 3 characters')
  if (!hashedPassword) errors.push('password hash required')

  const doc = {
    email     : str(email).toLowerCase(),
    username  : str(username),
    password  : hashedPassword,
    role      : 'user',
    isVerified: false,
    contributions: { placesAdded: 0, reviewsWritten: 0, photosUploaded: 0 },
    createdAt : new Date(),
  }

  return { doc, errors }
}

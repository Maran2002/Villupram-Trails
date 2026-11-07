/**
 * scripts/setup-indexes.mjs
 * ─────────────────────────────────────────────────────────────
 * Ensure MongoDB indexes are present for the application's query paths.
 *
 * Requires an explicit INDEX_SETUP_TARGET and a configured MongoDB URI.
 * Remote Atlas changes also require ALLOW_ATLAS_INDEX_SETUP=true.
 */

import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load the Next-style environment files without overriding the process env.
const inheritedEnvKeys = new Set(Object.keys(process.env))
for (const filename of ['.env', '.env.local']) {
  try {
    const env = readFileSync(resolve(__dirname, '..', filename), 'utf8')
    env.split(/\r?\n/).forEach(line => {
      const separator = line.indexOf('=')
      if (separator < 0) return
      const key = line.slice(0, separator).trim()
      const rawValue = line.slice(separator + 1).trim()
      const value = rawValue.replace(/^(['"])(.*)\1$/, '$2')
      if (!key || key.startsWith('#') || inheritedEnvKeys.has(key)) return
      if (filename === '.env.local' || process.env[key] === undefined) process.env[key] = value
    })
  } catch {}
}

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI must be configured before creating indexes')
}
const indexSetupTarget = process.env.INDEX_SETUP_TARGET
if (!['local', 'staging', 'production', 'atlas'].includes(indexSetupTarget)) {
  throw new Error('Set INDEX_SETUP_TARGET to local, staging, production, or atlas before creating indexes')
}
if (indexSetupTarget === 'production' && process.env.ALLOW_PRODUCTION_INDEX_SETUP !== 'true') {
  throw new Error('Production index setup requires ALLOW_PRODUCTION_INDEX_SETUP=true')
}
const uri = process.env.MONGODB_URI
let uriHost
try {
  uriHost = new URL(uri).hostname.replace(/^\[|\]$/g, '').toLowerCase()
} catch {
  throw new Error('MONGODB_URI is not a valid MongoDB URI')
}
if (indexSetupTarget === 'local' && !['localhost', '127.0.0.1', '::1'].includes(uriHost)) {
  throw new Error('INDEX_SETUP_TARGET=local requires a localhost MongoDB URI')
}
if (indexSetupTarget === 'atlas') {
  if (!uriHost.endsWith('.mongodb.net')) {
    throw new Error('INDEX_SETUP_TARGET=atlas requires a MongoDB Atlas hostname')
  }
  if (process.env.ALLOW_ATLAS_INDEX_SETUP !== 'true') {
    throw new Error('Atlas index setup requires ALLOW_ATLAS_INDEX_SETUP=true')
  }
}
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000, socketTimeoutMS: 30000 })

async function ensureIndexes(db, collectionName, definitions) {
  const collection = db.collection(collectionName)
  let existing = []
  try {
    existing = await collection.listIndexes().toArray()
  } catch (error) {
    if (error?.code !== 26 && error?.codeName !== 'NamespaceNotFound') throw error
  }

  const existingByName = new Map(existing.map(index => [index.name, index]))
  const missing = []
  for (const definition of definitions) {
    const current = existingByName.get(definition.name)
    if (!current) {
      missing.push(definition)
      continue
    }
    const expectedTextFields = Object.keys(definition.key).filter(field => definition.key[field] === 'text').sort()
    const keyMatches = expectedTextFields.length
      ? JSON.stringify(Object.keys(current.weights || {}).sort()) === JSON.stringify(expectedTextFields)
      : JSON.stringify(current.key) === JSON.stringify(definition.key)
    const matches =
      keyMatches &&
      Boolean(current.unique) === Boolean(definition.unique) &&
      current.expireAfterSeconds === definition.expireAfterSeconds &&
      JSON.stringify(current.partialFilterExpression || null) === JSON.stringify(definition.partialFilterExpression || null)
    if (!matches) throw new Error(`Existing index definition conflicts with ${collectionName}.${definition.name}`)
  }

  if (missing.length) await collection.createIndexes(missing)
}

async function main() {
  try {
    await client.connect()
    const db = client.db('villupuram_db')
    console.log(`Connected to the explicitly selected ${indexSetupTarget} target. Checking index definitions…\n`)

  /* ── places ──────────────────────────────────────────────── */
  console.log('Creating places indexes…')
  await ensureIndexes(db, 'places', [
    // Public browse: approved + recency
    { key: { status: 1, createdAt: -1 },            name: 'status_createdAt' },
    // Category filter
    { key: { category: 1, status: 1 },              name: 'category_status' },
    // Full-text search on name + description
    { key: { name: 'text', description: 'text' },   name: 'text_search' },
    // Dashboard: user's own places
    { key: { 'submittedBy.userId': 1, createdAt: -1 }, name: 'submittedBy_userId' },
    // NEW: filter by open day
    { key: { 'visitingHoursMeta.days': 1 },         name: 'visitingHours_days' },
    // Admin: status queue
    { key: { status: 1, updatedAt: -1 },            name: 'status_updatedAt' },
  ])
  console.log('✓ places indexes')

  /* ── reviews ─────────────────────────────────────────────── */
  console.log('Creating reviews indexes…')
  await ensureIndexes(db, 'reviews', [
    // Fetch reviews for a place (public: visible only)
    { key: { placeId: 1, visible: 1, createdAt: -1 }, name: 'placeId_visible_createdAt' },
    // User's own reviews for dashboard
    { key: { userId: 1, createdAt: -1 },              name: 'userId_createdAt' },
    // Rating recalculation
    { key: { placeId: 1, visible: 1 },                name: 'placeId_visible' },
  ])
  console.log('✓ reviews indexes')

  /* ── users ───────────────────────────────────────────────── */
  console.log('Creating users indexes…')
  await ensureIndexes(db, 'users', [
    { key: { email: 1 },    name: 'email_unique',    unique: true },
    { key: { username: 1 }, name: 'username_unique', unique: true },
    { key: { role: 1 },     name: 'role' },
  ])
  console.log('✓ users indexes')

  /* ── email OTPs ──────────────────────────────────────────── */
  console.log('Creating email verification indexes…')
  await ensureIndexes(db, 'email_verifications', [
    { key: { userId: 1, purpose: 1 }, name: 'email_otp_user_purpose_unique', unique: true },
    { key: { expiresAt: 1 }, name: 'email_otp_expiry_ttl', expireAfterSeconds: 0 },
  ])
  console.log('✓ email verification indexes (TTL: expiry time)')

  /* ── audit_logs ──────────────────────────────────────────── */
  console.log('Creating audit log indexes…')
  await ensureIndexes(db, 'audit_logs', [
    { key: { createdAt: -1 },       name: 'audit_createdAt' },
    { key: { action: 1 },           name: 'audit_action' },
    { key: { userId: 1 },           name: 'audit_userId' },
    { key: { target: 1, targetId: 1 }, name: 'audit_target_targetId' },
    // Auto-expire logs after 365 days
    { key: { createdAt: 1 }, name: 'audit_ttl', expireAfterSeconds: 60 * 60 * 24 * 365 },
  ])
  console.log('✓ audit_logs indexes (TTL: 365 days)')

  /* ── favorites ───────────────────────────────────────────── */
  console.log('Creating favorites indexes…')
  await ensureIndexes(db, 'favorites', [
    { key: { userId: 1, placeId: 1 }, name: 'user_place_unique', unique: true },
    { key: { userId: 1, createdAt: -1 }, name: 'user_createdAt' },
  ])
  console.log('✓ favorites indexes')

  /* ── newsletter subscribers ─────────────────────────────── */
  console.log('Creating newsletter indexes…')
  await ensureIndexes(db, 'newsletter_subscribers', [
    { key: { email: 1 }, name: 'newsletter_email_unique', unique: true },
    { key: { subscribedAt: -1 }, name: 'newsletter_subscribedAt' },
  ])
  console.log('✓ newsletter subscriber indexes')

  /* ── support tickets ─────────────────────────────────────── */
  console.log('Creating support ticket indexes…')
  await ensureIndexes(db, 'support_tickets', [
    { key: { status: 1, createdAt: -1 }, name: 'support_status_createdAt' },
    { key: { email: 1, createdAt: -1 }, name: 'support_email_createdAt' },
    { key: { updatedAt: 1 }, name: 'support_closed_ttl', expireAfterSeconds: 60 * 60 * 24 * 365, partialFilterExpression: { status: 'closed' } },
  ])
  console.log('✓ support ticket indexes')

  /* ── reports ─────────────────────────────────────────────── */
  console.log('Creating report indexes…')
  await ensureIndexes(db, 'reports', [
    { key: { reporterId: 1, createdAt: -1 }, name: 'reports_reporter_createdAt' },
    { key: { status: 1, createdAt: -1 }, name: 'reports_status_createdAt' },
    { key: { createdAt: -1 }, name: 'reports_createdAt' },
    { key: { updatedAt: 1 }, name: 'reports_closed_ttl', expireAfterSeconds: 60 * 60 * 24 * 365, partialFilterExpression: { status: 'closed' } },
  ])
  console.log('✓ report indexes')

  /* ── visitor logs ────────────────────────────────────────── */
  console.log('Creating visitor log indexes…')
  await ensureIndexes(db, 'visitor_logs', [
    { key: { timestamp: -1 }, name: 'visitor_timestamp' },
    { key: { timestamp: 1 }, name: 'visitor_ttl', expireAfterSeconds: 60 * 60 * 24 * 90 },
  ])
  console.log('✓ visitor log indexes')

    console.log('\nAll indexes created successfully.')
  } finally {
    await client.close()
  }
}

main().catch(err => {
  console.error('Index setup failed:', err?.name || 'Error', `code=${err?.code || 'unknown'}`)
  process.exitCode = 1
})

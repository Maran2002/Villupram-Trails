/**
 * scripts/setup-indexes.mjs
 * ─────────────────────────────────────────────────────────────
 * Run once to create MongoDB indexes for optimal query performance.
 *
 * Usage:
 *   node scripts/setup-indexes.mjs
 *
 * Requires MONGODB_URI in .env.local (auto-loaded via dotenv).
 */

import { MongoClient } from 'mongodb'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local manually
try {
  const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim()
  })
} catch {}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/villupuram_db'
const client = new MongoClient(uri)

async function main() {
  await client.connect()
  const db = client.db('villupuram_db')
  console.log('Connected. Creating indexes…\n')

  /* ── places ──────────────────────────────────────────────── */
  await db.collection('places').createIndexes([
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
  await db.collection('reviews').createIndexes([
    // Fetch reviews for a place (public: visible only)
    { key: { placeId: 1, visible: 1, createdAt: -1 }, name: 'placeId_visible_createdAt' },
    // User's own reviews for dashboard
    { key: { userId: 1, createdAt: -1 },              name: 'userId_createdAt' },
    // Rating recalculation
    { key: { placeId: 1, visible: 1 },                name: 'placeId_visible' },
  ])
  console.log('✓ reviews indexes')

  /* ── users ───────────────────────────────────────────────── */
  await db.collection('users').createIndexes([
    { key: { email: 1 },    name: 'email_unique',    unique: true },
    { key: { username: 1 }, name: 'username_unique', unique: true },
    { key: { role: 1 },     name: 'role' },
  ])
  console.log('✓ users indexes')

  /* ── audit_logs ──────────────────────────────────────────── */
  await db.collection('audit_logs').createIndexes([
    { key: { createdAt: -1 },       name: 'audit_createdAt' },
    { key: { action: 1 },           name: 'audit_action' },
    { key: { userId: 1 },           name: 'audit_userId' },
    { key: { target: 1, targetId: 1 }, name: 'audit_target_targetId' },
    // Auto-expire logs after 365 days
    { key: { createdAt: 1 }, name: 'audit_ttl', expireAfterSeconds: 60 * 60 * 24 * 365 },
  ])
  console.log('✓ audit_logs indexes (TTL: 365 days)')

  console.log('\nAll indexes created successfully.')
  await client.close()
}

main().catch(err => { console.error(err); process.exit(1) })

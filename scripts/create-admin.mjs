/**
 * scripts/create-admin.mjs
 * ─────────────────────────────────────────────────────────────
 * Creates an admin user in the database.
 * Run once:  node scripts/create-admin.mjs
 */

import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { ObjectId } from 'mongodb'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
try {
  const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim()
  })
} catch {}

const uri = process.env.MONGODB_URI
const ADMIN_USERNAME = process.env.INITIAL_ADMIN_USERNAME?.trim()
const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase()
const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD
const REQUIRED_MODULES = ['places', 'reviews', 'users', 'audit', 'reports', 'settings', 'contributors', 'logs', 'approvals', 'support', 'search']

if (!uri) throw new Error('MONGODB_URI must be configured; refusing to use a local default database')
if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  throw new Error('Set INITIAL_ADMIN_USERNAME, INITIAL_ADMIN_EMAIL, and INITIAL_ADMIN_PASSWORD (at least 12 characters)')
}

async function main() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db('villupuram_db')

  const existing = await db.collection('users').findOne({
    $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }]
  })

  if (existing) {
    await client.close()
    throw new Error('An account with the requested username or email already exists; no changes were made')
  }

  const existingAdmin = await db.collection('users').findOne({ role: 'admin' }, { projection: { _id: 1 } })
  if (existingAdmin) {
    await client.close()
    throw new Error('An administrator already exists; use the authenticated user management workflow')
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12)
  const superadminId = new ObjectId()
  const permissions = Object.fromEntries(REQUIRED_MODULES.map((module) => [module, {
    view: true, add: true, edit: true, delete: true,
  }]))
  await db.collection('users').insertOne({
    _id          : superadminId,
    username     : ADMIN_USERNAME,
    email        : ADMIN_EMAIL,
    password     : hashed,
    role         : 'admin',
    permissions,
    sessionVersion: 0,
    isVerified   : true,
    contributions: { placesAdded: 0, reviewsWritten: 0, photosUploaded: 0 },
    createdAt    : new Date(),
  })

  console.log('Initial administrator created. Configure SUPERADMIN_ID with this account ID and restart the application before using administrative APIs:')
  console.log(superadminId.toString())
  await client.close()
}

main().catch(err => { console.error(err); process.exit(1) })

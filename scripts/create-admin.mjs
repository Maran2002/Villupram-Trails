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

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
try {
  const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf8')
  env.split('\n').forEach(line => {
    const [k, ...v] = line.split('=')
    if (k && !k.startsWith('#')) process.env[k.trim()] = v.join('=').trim()
  })
} catch {}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/villupuram_db'

// ── Admin credentials (change before running) ────────────────
const ADMIN_USERNAME = 'vpm_admin'
const ADMIN_EMAIL    = 'admin@villupuram.local'
const ADMIN_PASSWORD = 'Admin@2026!'   // ← change this
// ─────────────────────────────────────────────────────────────

async function main() {
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db('villupuram_db')

  const existing = await db.collection('users').findOne({
    $or: [{ username: ADMIN_USERNAME }, { email: ADMIN_EMAIL }]
  })

  if (existing) {
    console.log(`⚠  User "${existing.username}" already exists (role: ${existing.role}).`)
    if (existing.role !== 'admin') {
      await db.collection('users').updateOne(
        { _id: existing._id },
        { $set: { role: 'admin' } }
      )
      console.log('✓  Role updated to admin.')
    } else {
      console.log('   Nothing to do.')
    }
    await client.close()
    return
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12)
  await db.collection('users').insertOne({
    username     : ADMIN_USERNAME,
    email        : ADMIN_EMAIL,
    password     : hashed,
    role         : 'admin',
    isVerified   : true,
    contributions: { placesAdded: 0, reviewsWritten: 0, photosUploaded: 0 },
    createdAt    : new Date(),
  })

  console.log('✓  Admin user created successfully.\n')
  console.log('  Username :', ADMIN_USERNAME)
  console.log('  Email    :', ADMIN_EMAIL)
  console.log('  Password :', ADMIN_PASSWORD)
  await client.close()
}

main().catch(err => { console.error(err); process.exit(1) })

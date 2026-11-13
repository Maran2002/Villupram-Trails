import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden, hasPermission, writeAudit, SUPERADMIN_ID, isSuperAdmin } from '@/lib/auth'
import { ObjectId } from 'mongodb'
import { buildUserPatch } from '@/lib/schemas'
import bcrypt from 'bcryptjs'

// PUT /api/admin/users/[id] — update user/admin
export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'users', 'edit')) return forbidden()

    const { id } = await params
    if (!ObjectId.isValid(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    const targetId = new ObjectId(id).toString()

    const body = await readJson(request)

    if ((body.role !== undefined || body.permissions !== undefined) && !isSuperAdmin(user)) {
      return forbidden('Only the superadmin can change roles or permissions')
    }

    // Prevent modifying superadmin by anyone else
    if (targetId === SUPERADMIN_ID.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Cannot modify Superadmin' }, { status: 403 })
    }

    const { patch, errors } = buildUserPatch(body)
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join('; ') }, { status: 422 })
    }

    if (body.isVerified !== undefined) {
      return NextResponse.json({ success: false, error: 'Email verification requires a code from the account holder' }, { status: 422 })
    }

    if (body.password) {
      if (typeof body.password !== 'string' || body.password.length < 12) return NextResponse.json({ success: false, error: 'Password must be at least 12 characters' }, { status: 422 })
      patch.password = await bcrypt.hash(body.password, 10)
    }

    const db = await getDb()

    // check email/username conflict
    if (patch.email || patch.username) {
      const conflictQuery = { _id: { $ne: new ObjectId(id) }, $or: [] }
      if (patch.email) conflictQuery.$or.push({ email: patch.email })
      if (patch.username) conflictQuery.$or.push({ username: patch.username })
      const existing = await db.collection('users').findOne(conflictQuery)
      if (existing) return NextResponse.json({ success: false, error: 'Email or username already taken' }, { status: 409 })
    }

    // MongoDB driver v5: findOneAndUpdate returns the document directly (not wrapped in .value)
    const target = await db.collection('users').findOne({ _id: new ObjectId(id) }, { projection: { email: 1 } })
    if (!target) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    if (patch.email !== undefined && patch.email !== target.email) {
      return NextResponse.json({ success: false, error: 'Account holders must verify a new email in Account Settings' }, { status: 422 })
    }
    delete patch.email
    const update = { $set: patch }
    if (patch.password || patch.role || patch.permissions) {
      update.$inc = { sessionVersion: 1 }
    }
    const updated = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id), email: target.email },
      update,
      { returnDocument: 'after', projection: { password: 0 } }
    )

    if (!updated) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'user.update', target: 'user', targetId: id,
      meta: { updatedFields: Object.keys(patch) }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] — delete user/admin
export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'users', 'delete')) return forbidden()

    const { id } = await params
    if (!ObjectId.isValid(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })
    const targetId = new ObjectId(id).toString()

    if (targetId === SUPERADMIN_ID.toLowerCase()) {
      return NextResponse.json({ success: false, error: 'Cannot delete Superadmin' }, { status: 403 })
    }

    if (targetId === user._id.toString()) {
      return NextResponse.json({ success: false, error: 'Cannot delete yourself' }, { status: 400 })
    }

    const db = await getDb()
    // MongoDB driver v5: findOneAndDelete returns the document directly
    const deleted = await db.collection('users').findOneAndDelete({ _id: new ObjectId(id) })

    if (!deleted) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'user.delete', target: 'user', targetId: id,
      meta: { deletedUsername: deleted.username }
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 })
  }
}

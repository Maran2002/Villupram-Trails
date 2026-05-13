import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden, hasPermission, writeAudit, SUPERADMIN_ID } from '@/lib/auth'
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

    const body = await request.json()

    // Prevent modifying superadmin by anyone else
    if (id === SUPERADMIN_ID) {
      return NextResponse.json({ success: false, error: 'Cannot modify Superadmin' }, { status: 403 })
    }

    const { patch, errors } = buildUserPatch(body)
    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join('; ') }, { status: 422 })
    }

    if (body.password) {
      if (body.password.length < 6) return NextResponse.json({ success: false, error: 'Password too short' }, { status: 422 })
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
    const updated = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: patch },
      { returnDocument: 'after', projection: { password: 0 } }
    )

    if (!updated) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'user.update', target: 'user', targetId: id,
      meta: { updatedFields: Object.keys(patch) }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch {
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

    if (id === SUPERADMIN_ID) {
      return NextResponse.json({ success: false, error: 'Cannot delete Superadmin' }, { status: 403 })
    }

    if (id === user._id.toString()) {
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

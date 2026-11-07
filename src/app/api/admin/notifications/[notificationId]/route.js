import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { getDb } from '@/lib/mongodb'
import { getAvailableNotificationRoles, normalizeNotificationInput, serializeNotification } from '@/lib/notifications'

export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'notifications', 'edit')) return forbidden()

    const { notificationId } = await params
    if (!ObjectId.isValid(notificationId)) return NextResponse.json({ success: false, error: 'Invalid notification ID' }, { status: 400 })

    const body = await request.json()
    const db = await getDb()
    const roles = await getAvailableNotificationRoles(db)
    const { value, error } = normalizeNotificationInput(body, roles)
    if (error) return NextResponse.json({ success: false, error }, { status: 422 })

    const now = new Date()
    const updated = await db.collection('notifications').findOneAndUpdate(
      { _id: new ObjectId(notificationId) },
      { $set: { ...value, updatedAt: now } },
      { returnDocument: 'after' }
    )
    if (!updated) return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 })

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'notification.update', target: 'notification', targetId: notificationId,
      meta: { title: value.title, audienceRoles: value.audienceRoles },
    })

    return NextResponse.json({ success: true, data: serializeNotification(updated) })
  } catch (error) {
    console.error('Update notification error:', error)
    return NextResponse.json({ success: false, error: 'Could not update notification' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'notifications', 'delete')) return forbidden()

    const { notificationId } = await params
    if (!ObjectId.isValid(notificationId)) return NextResponse.json({ success: false, error: 'Invalid notification ID' }, { status: 400 })

    const db = await getDb()
    const deleted = await db.collection('notifications').findOneAndDelete({ _id: new ObjectId(notificationId) })
    if (!deleted) return NextResponse.json({ success: false, error: 'Notification not found' }, { status: 404 })

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'notification.delete', target: 'notification', targetId: notificationId,
      meta: { title: deleted.title },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete notification error:', error)
    return NextResponse.json({ success: false, error: 'Could not delete notification' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { getDb } from '@/lib/mongodb'
import { getAvailableNotificationRoles, normalizeNotificationInput, serializeNotification } from '@/lib/notifications'

const PAGE_LIMIT = 20

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'notifications', 'view')) return forbidden()

    const { searchParams } = new URL(request.url)
    const rawPage = Number.parseInt(searchParams.get('page') || '1', 10)
    const page = Number.isFinite(rawPage) ? Math.max(1, rawPage) : 1
    const search = (searchParams.get('search') || '').trim().slice(0, 100)
    const query = search ? {
      $or: [
        { title: { $regex: escapeRegex(search), $options: 'i' } },
        { description: { $regex: escapeRegex(search), $options: 'i' } },
        { badge: { $regex: escapeRegex(search), $options: 'i' } },
        { audienceRoles: { $regex: escapeRegex(search), $options: 'i' } },
      ],
    } : {}

    const db = await getDb()
    const collection = db.collection('notifications')
    const [items, total, roles] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip((page - 1) * PAGE_LIMIT).limit(PAGE_LIMIT).toArray(),
      collection.countDocuments(query),
      getAvailableNotificationRoles(db),
    ])

    return NextResponse.json({
      success: true,
      data: items.map(serializeNotification),
      meta: { total, page, limit: PAGE_LIMIT, pages: Math.ceil(total / PAGE_LIMIT), roles },
    })
  } catch (error) {
    console.error('Fetch admin notifications error:', error)
    return NextResponse.json({ success: false, error: 'Could not load notifications' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'notifications', 'add')) return forbidden()

    const body = await request.json()
    const db = await getDb()
    const roles = await getAvailableNotificationRoles(db)
    const { value, error } = normalizeNotificationInput(body, roles)
    if (error) return NextResponse.json({ success: false, error }, { status: 422 })

    const now = new Date()
    const notification = {
      ...value,
      createdAt: now,
      updatedAt: now,
      createdBy: { userId: user._id, username: user.username },
    }
    const result = await db.collection('notifications').insertOne(notification)
    notification._id = result.insertedId

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'notification.create', target: 'notification', targetId: result.insertedId,
      meta: { title: value.title, audienceRoles: value.audienceRoles },
    })

    return NextResponse.json({ success: true, data: serializeNotification(notification) }, { status: 201 })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ success: false, error: 'Could not publish notification' }, { status: 500 })
  }
}

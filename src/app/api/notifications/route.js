import { NextResponse } from 'next/server'
import { getAuthUser, unauthorized } from '@/lib/auth'
import { getDb } from '@/lib/mongodb'
import { serializeNotification } from '@/lib/notifications'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const db = await getDb()
    const notifications = await db.collection('notifications')
      .find({ audienceRoles: user.role }, { projection: { title: 1, description: 1, badge: 1, audienceRoles: 1, createdAt: 1, updatedAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray()

    return NextResponse.json({ success: true, data: notifications.map(serializeNotification) })
  } catch (error) {
    console.error('Fetch notifications error:', error)
    return NextResponse.json({ success: false, error: 'Could not load notifications' }, { status: 500 })
  }
}

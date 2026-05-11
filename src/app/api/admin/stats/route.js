import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (user.role !== 'admin') return forbidden()

    const db = await getDb()

    const [
      totalUsers, totalPlaces, totalReviews,
      pendingPlaces, hiddenReviews,
      recentUsers, recentPlaces,
    ] = await Promise.all([
      db.collection('users').countDocuments({}),
      db.collection('places').countDocuments({ status: 'Approved' }),
      db.collection('reviews').countDocuments({ visible: true }),
      db.collection('places').countDocuments({ status: 'Pending' }),
      db.collection('reviews').countDocuments({ visible: false }),
      // New users in last 30 days
      db.collection('users').countDocuments({ createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } }),
      // New approved places in last 7 days
      db.collection('places').countDocuments({ status: 'Approved', createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } }),
    ])

    // Recent 5 audit log entries for activity feed
    const recentActivity = await db.collection('audit_logs')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    return NextResponse.json({
      success: true,
      data: {
        totalUsers, totalPlaces, totalReviews,
        pendingPlaces, hiddenReviews,
        pendingApprovals: pendingPlaces + hiddenReviews,
        recentUsers, recentPlaces,
        recentActivity,
      }
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 })
  }
}

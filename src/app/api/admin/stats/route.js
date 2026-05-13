import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (user.role !== 'admin') return forbidden()

    const db = await getDb()

    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * 86400000)
    const weekAgo = new Date(now.getTime() - 7 * 86400000)

    const [
      totalUsers, recentUsers,
      totalPlaces, recentPlaces, pendingPlaces,
      totalReviews, hiddenReviews,
      recentActivity,
      openTickets, totalSupport
    ] = await Promise.all([
      db.collection('users').countDocuments({}),
      db.collection('users').countDocuments({ createdAt: { $gte: monthAgo } }),
      db.collection('places').countDocuments({ status: 'Approved' }),
      db.collection('places').countDocuments({ createdAt: { $gte: weekAgo }, status: 'Approved' }),
      db.collection('places').countDocuments({ 
        $or: [
          { status: 'Pending' },
          { pendingUpdate: { $exists: true } }
        ]
      }),
      db.collection('reviews').countDocuments({}),
      db.collection('reviews').countDocuments({ visible: false }),
      db.collection('audit_logs').find({}).sort({ createdAt: -1 }).limit(10).toArray(),
      db.collection('support_tickets').countDocuments({ status: 'open' }),
      db.collection('support_tickets').countDocuments({}),
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers, recentUsers,
        totalPlaces, recentPlaces, pendingApprovals: pendingPlaces,
        totalReviews, hiddenReviews,
        recentActivity,
        openTickets, totalSupport
      }
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 })
  }
}

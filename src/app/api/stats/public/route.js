import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()

    const [
      totalPlaces, totalUsers, totalReviews,
      monthlyPageViews
    ] = await Promise.all([
      db.collection('places').countDocuments({ status: 'Approved' }),
      db.collection('users').countDocuments({ role: { $ne: 'admin' } }),
      db.collection('reviews').countDocuments({ visible: true }),
      // The tracker does not collect an IP or stable visitor identifier, so report page views.
      db.collection('visitor_logs').countDocuments({
        timestamp: { $gte: new Date(Date.now() - 30 * 86400000) } 
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalPlaces,
        totalUsers,
        totalReviews,
        monthlyPageViews
      }
    })
  } catch (error) {
    console.error('Public stats error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 })
  }
}

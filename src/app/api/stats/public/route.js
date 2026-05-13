import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()

    const [
      totalPlaces, totalUsers, totalReviews,
      monthlyVisitors
    ] = await Promise.all([
      db.collection('places').countDocuments({ status: 'Approved' }),
      db.collection('users').countDocuments({}),
      db.collection('reviews').countDocuments({ visible: true }),
      // Unique visitors in last 30 days
      db.collection('visitor_logs').distinct('ip', { 
        timestamp: { $gte: new Date(Date.now() - 30 * 86400000) } 
      }).then(res => res.length)
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalPlaces,
        totalUsers,
        totalReviews,
        monthlyVisitors
      }
    })
  } catch (error) {
    console.error('Public stats error:', error)
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 })
  }
}

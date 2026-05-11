import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized } from '@/lib/auth'

// GET /api/dashboard/my-contributions
// Returns the logged-in user's own places (all statuses) + reviews
export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const db = await getDb()

    const [places, reviews] = await Promise.all([
      db.collection('places')
        .find({ 'submittedBy.userId': user._id })
        .sort({ createdAt: -1 })
        .toArray(),
      db.collection('reviews')
        .find({ userId: user._id })
        .sort({ createdAt: -1 })
        .toArray(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        places,
        reviews,
        stats: {
          placesAdded: places.length,
          placesApproved: places.filter(p => p.status === 'Approved').length,
          placesPending: places.filter(p => p.status === 'Pending').length,
          placesRejected: places.filter(p => p.status === 'Rejected').length,
          reviewsWritten: reviews.length,
        }
      }
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch contributions' }, { status: 500 })
  }
}

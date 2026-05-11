import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const db = await getDb()

    // Per-user stats
    const [myPlaces, myReviews] = await Promise.all([
      db.collection('places').find({ 'submittedBy.userId': user._id }).toArray(),
      db.collection('reviews').find({ userId: user._id }).toArray(),
    ])

    const avgRating = myReviews.length
      ? myReviews.reduce((s, r) => s + (r.rating || 0), 0) / myReviews.length
      : 0

    return NextResponse.json({
      success: true,
      data: {
        placesAdded: myPlaces.length,
        placesApproved: myPlaces.filter(p => p.status === 'Approved').length,
        placesPending: myPlaces.filter(p => p.status === 'Pending').length,
        reviewsWritten: myReviews.length,
        photosUploaded: 0,
        averageRating: Math.round(avgRating * 10) / 10,
      }
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
  }
}

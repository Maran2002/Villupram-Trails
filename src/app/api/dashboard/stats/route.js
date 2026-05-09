import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET(request) {
  try {
    const db = await getDb()
    
    // In a real scenario, we would parse the user ID from the request JWT token
    // For now, we simulate fetching stats
    const stats = {
      placesAdded: await db.collection('places').countDocuments(),
      reviewsWritten: await db.collection('reviews').countDocuments(),
      photosUploaded: 0,
      averageRating: 0
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}

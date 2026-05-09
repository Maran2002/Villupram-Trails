import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const db = await getDb()

    // Fetch places and reviews that are pending approval
    const pendingPlaces = await db.collection('places').find({ status: 'Pending' }).toArray()
    const pendingReviews = await db.collection('reviews').find({ status: 'Pending' }).toArray()

    const approvals = [
      ...pendingPlaces.map(p => ({ ...p, type: 'Place' })),
      ...pendingReviews.map(r => ({ ...r, type: 'Review' }))
    ]

    return NextResponse.json({ success: true, data: approvals })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch approvals' },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { itemId, type, action } = body
    const db = await getDb()
    
    const collectionName = type === 'Place' ? 'places' : 'reviews'
    const newStatus = action === 'approve' ? 'Approved' : 'Rejected'

    const result = await db.collection(collectionName).findOneAndUpdate(
      { _id: new ObjectId(itemId) },
      { $set: { status: newStatus, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process approval' },
      { status: 500 }
    )
  }
}

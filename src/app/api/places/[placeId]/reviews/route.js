import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request, { params }) {
  try {
    const { placeId } = await params
    const db = await getDb()

    const reviews = await db.collection('reviews')
      .find({ placeId: new ObjectId(placeId) })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ success: true, data: reviews })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { placeId } = await params
    const body = await request.json()
    const db = await getDb()
    
    const newReview = {
      ...body,
      placeId: new ObjectId(placeId),
      createdAt: new Date()
    }

    const result = await db.collection('reviews').insertOne(newReview)
    
    // Update place rating logic could go here
    
    return NextResponse.json({ success: true, data: { ...newReview, _id: result.insertedId } }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}

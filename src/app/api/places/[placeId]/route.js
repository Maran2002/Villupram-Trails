import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request, { params }) {
  try {
    const { placeId } = await params
    const db = await getDb()
    
    const place = await db.collection('places').findOne({ _id: new ObjectId(placeId) })
    
    if (!place) {
      return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: place })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch place details' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { placeId } = await params
    const body = await request.json()
    const db = await getDb()

    const result = await db.collection('places').findOneAndUpdate(
      { _id: new ObjectId(placeId) },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update place' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { placeId } = await params
    const db = await getDb()

    await db.collection('places').deleteOne({ _id: new ObjectId(placeId) })
    
    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete place' },
      { status: 500 }
    )
  }
}

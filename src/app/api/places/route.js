import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 12
    const category = searchParams.get('category')

    const db = await getDb()
    const query = category ? { category } : {}
    
    // Check if connected successfully
    if (!db) {
      throw new Error('Database connection failed')
    }

    const places = await db.collection('places')
      .find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()
      
    const total = await db.collection('places').countDocuments(query)

    return NextResponse.json({
      success: true,
      data: {
        items: places,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch places' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const db = await getDb()
    
    const newPlace = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'Pending',
      rating: 0,
      reviewCount: 0
    }
    
    const result = await db.collection('places').insertOne(newPlace)

    return NextResponse.json({ success: true, data: { ...newPlace, _id: result.insertedId } }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create place' },
      { status: 500 }
    )
  }
}

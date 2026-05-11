import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (user.role !== 'admin') return forbidden()

    const { searchParams } = new URL(request.url)
    const page   = Math.max(1, parseInt(searchParams.get('page'))  || 1)
    const limit  = Math.min(100, parseInt(searchParams.get('limit')) || 20)
    const search = searchParams.get('search')
    const visible = searchParams.get('visible')

    const db = await getDb()
    const query = {}

    if (search) {
      query.$or = [
        { author:  { $regex: search, $options: 'i' } },
        { comment: { $regex: search, $options: 'i' } },
      ]
    }
    
    if (visible === 'true') query.visible = true
    if (visible === 'false') query.visible = false

    const [reviews, total] = await Promise.all([
      db.collection('reviews')
        .aggregate([
          { $match: query },
          { $sort: { createdAt: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: 'places',
              localField: 'placeId',
              foreignField: '_id',
              as: 'place'
            }
          },
          { $unwind: { path: '$place', preserveNullAndEmptyArrays: true } }
        ])
        .toArray(),
      db.collection('reviews').countDocuments(query)
    ])

    return NextResponse.json({
      success: true,
      data: { reviews, total, page, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

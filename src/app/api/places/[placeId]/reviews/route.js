import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthUser, verifyToken, unauthorized, writeAudit } from '@/lib/auth'
import { buildReviewDoc } from '@/lib/schemas'

export async function GET(request, { params }) {
  try {
    const { placeId } = await params
    if (!ObjectId.isValid(placeId)) {
      return NextResponse.json({ success: false, error: 'Invalid place ID' }, { status: 400 })
    }

    const db      = await getDb()
    const decoded = verifyToken(request)

    const query = { placeId: new ObjectId(placeId) }
    if (!decoded || decoded.role !== 'admin') query.visible = true

    const { searchParams } = new URL(request.url)
    const page  = Math.max(1, parseInt(searchParams.get('page'))  || 1)
    const limit = Math.min(50, parseInt(searchParams.get('limit')) || 20)

    const [reviews, total] = await Promise.all([
      db.collection('reviews').find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      db.collection('reviews').countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: reviews,
      meta: { total, page, pages: Math.ceil(total / limit) }
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  try {
    const { placeId } = await params
    if (!ObjectId.isValid(placeId)) {
      return NextResponse.json({ success: false, error: 'Invalid place ID' }, { status: 400 })
    }

    const user = await getAuthUser(request)
    if (!user) return unauthorized('Please log in to write a review')

    const body = await request.json()
    const placeOid = new ObjectId(placeId)
    const { doc, errors } = buildReviewDoc(body, user, placeOid)

    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join('; ') }, { status: 422 })
    }

    const db = await getDb()

    // Ensure the place exists and is approved
    const place = await db.collection('places').findOne({ _id: placeOid })
    if (!place) return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 })

    const result = await db.collection('reviews').insertOne(doc)

    // Recalculate aggregate rating on the place
    const allVisible = await db.collection('reviews')
      .find({ placeId: placeOid, visible: true })
      .toArray()
    const avgRating = allVisible.length
      ? allVisible.reduce((s, r) => s + (r.rating || 0), 0) / allVisible.length
      : 0
    await db.collection('places').updateOne(
      { _id: placeOid },
      { $set: { rating: Math.round(avgRating * 10) / 10, reviewCount: allVisible.length } }
    )

    await db.collection('users').updateOne(
      { _id: user._id },
      { $inc: { 'contributions.reviewsWritten': 1 } }
    )

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'review.create', target: 'review',
      targetId: result.insertedId,
      meta: { placeId, rating: doc.rating },
    })

    return NextResponse.json(
      { success: true, data: { ...doc, _id: result.insertedId } },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 })
  }
}

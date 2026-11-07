import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthUser, unauthorized, writeAudit } from '@/lib/auth'
import { buildReviewDoc } from '@/lib/schemas'
import { hasPermission } from '@/lib/permissions'
import clientPromise from '@/lib/mongodb'
import { recalculatePlaceReviewStats } from '@/lib/reviewStats'

export async function GET(request, { params }) {
  try {
    const { placeId } = await params
    if (!ObjectId.isValid(placeId)) {
      return NextResponse.json({ success: false, error: 'Invalid place ID' }, { status: 400 })
    }

    const db      = await getDb()
    const user = await getAuthUser(request)

    const query = { placeId: new ObjectId(placeId) }
    if (!hasPermission(user, 'reviews', 'view')) query.visible = true

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
    if (user.role === 'admin' && !hasPermission(user, 'reviews', 'add')) {
      return NextResponse.json({ success: false, error: 'You do not have permission to submit reviews' }, { status: 403 })
    }
    if (user.role !== 'admin' && user.isVerified !== true) {
      return NextResponse.json({ success: false, error: 'Your account must be verified before writing a review' }, { status: 403 })
    }

    const body = await request.json()
    const placeOid = new ObjectId(placeId)
    const { doc, errors } = buildReviewDoc(body, user, placeOid)

    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join('; ') }, { status: 422 })
    }

    const db = await getDb()
    const settings = await db.collection('settings').findOne({ _id: 'site_config' })

    // If review approval is required, set visible to false for non-admins
    if (!hasPermission(user, 'reviews', 'add') && user.role !== 'admin' && settings?.requireReviewApproval === true) {
      doc.visible = false
    }

    // Ensure the place exists and is approved
    const place = await db.collection('places').findOne({ _id: placeOid })
    if (!place || (place.status !== 'Approved' && !hasPermission(user, 'places', 'view'))) {
      return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 })
    }

    const client = await clientPromise
    const session = client.startSession()
    let result
    try {
      await session.withTransaction(async () => {
        result = await db.collection('reviews').insertOne(doc, { session })
        await recalculatePlaceReviewStats(db, placeOid, session)
        await db.collection('users').updateOne(
          { _id: user._id },
          { $inc: { 'contributions.reviewsWritten': 1 } },
          { session }
        )
      })
    } finally {
      await session.endSession()
    }

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

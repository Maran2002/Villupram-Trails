import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import clientPromise from '@/lib/mongodb'
import { decrementReviewContribution, recalculatePlaceReviewStats } from '@/lib/reviewStats'

export async function PUT(request, { params }) {
  try {
    const { reviewId } = await params
    if (!ObjectId.isValid(reviewId)) {
      return NextResponse.json({ success: false, error: 'Invalid review ID' }, { status: 400 })
    }

    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'reviews', 'edit')) return forbidden()

    const body = await request.json()
    const { comment, rating, visible } = body
    if (comment !== undefined && (typeof comment !== 'string' || !comment.trim() || comment.length > 2000)) {
      return NextResponse.json({ success: false, error: 'Comment must be between 1 and 2000 characters' }, { status: 422 })
    }
    if (rating !== undefined && (!Number.isFinite(Number(rating)) || Number(rating) < 1 || Number(rating) > 5)) {
      return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5' }, { status: 422 })
    }
    if (visible !== undefined && typeof visible !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Visibility must be a boolean' }, { status: 422 })
    }

    const db = await getDb()
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(reviewId) })
    
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
    }

    const update = { $set: { updatedAt: new Date() } }
    if (comment !== undefined) update.$set.comment = comment
    if (rating !== undefined)  update.$set.rating = Number(rating)
    if (visible !== undefined) update.$set.visible = visible

    const client = await clientPromise
    const session = client.startSession()
    let updatedReview = null
    try {
      await session.withTransaction(async () => {
        await db.collection('reviews').updateOne({ _id: review._id }, update, { session })
        await recalculatePlaceReviewStats(db, review.placeId, session)
        updatedReview = await db.collection('reviews').findOne({ _id: review._id }, { session })
      })
    } finally {
      await session.endSession()
    }
    if (!updatedReview) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'review.admin_edit', target: 'review', targetId: reviewId,
      meta: { placeId: review.placeId, oldVisible: review.visible, newVisible: visible }
    })

    return NextResponse.json({ success: true, data: updatedReview })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { reviewId } = await params
    if (!ObjectId.isValid(reviewId)) {
      return NextResponse.json({ success: false, error: 'Invalid review ID' }, { status: 400 })
    }

    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'reviews', 'delete')) return forbidden()

    const db = await getDb()
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(reviewId) })
    
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
    }

    const client = await clientPromise
    const session = client.startSession()
    let deleted = false
    try {
      await session.withTransaction(async () => {
        const result = await db.collection('reviews').deleteOne({ _id: review._id }, { session })
        deleted = result.deletedCount === 1
        if (!deleted) return
        await recalculatePlaceReviewStats(db, review.placeId, session)
        await decrementReviewContribution(db, review.userId, session)
      })
    } finally {
      await session.endSession()
    }
    if (!deleted) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'review.delete', target: 'review', targetId: reviewId,
      meta: { placeId: review.placeId, author: review.author }
    })

    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 })
  }
}

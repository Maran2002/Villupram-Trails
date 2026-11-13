import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import clientPromise from '@/lib/mongodb'
import { decrementReviewContribution, recalculatePlaceReviewStats } from '@/lib/reviewStats'

// DELETE /api/reviews/[reviewId] — owner deletes own, admin deletes any
export async function DELETE(request, { params }) {
  try {
    const { reviewId } = await params
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const db = await getDb()
    if (!ObjectId.isValid(reviewId)) return NextResponse.json({ success: false, error: 'Invalid review ID' }, { status: 400 })
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(reviewId) })
    if (!review) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })

    const isOwner = review.userId?.toString() === user._id.toString()
    if (!isOwner && !hasPermission(user, 'reviews', 'delete')) return forbidden('You can only delete your own reviews')

    const client = await clientPromise
    const session = client.startSession()
    let deleted = false
    try {
      await session.withTransaction(async () => {
        const deleteFilter = hasPermission(user, 'reviews', 'delete')
          ? { _id: review._id }
          : { _id: review._id, userId: user._id }
        const result = await db.collection('reviews').deleteOne(deleteFilter, { session })
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
      meta: { placeId: review.placeId?.toString(), deletedBy: user.role },
    })

    return NextResponse.json({ success: true, message: 'Review deleted' })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 })
  }
}

// PATCH /api/reviews/[reviewId] — admin toggles visibility
export async function PATCH(request, { params }) {
  try {
    const { reviewId } = await params
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'reviews', 'edit')) return forbidden('You do not have permission to moderate reviews')

    const { visible } = await readJson(request)
    if (typeof visible !== 'boolean' || !ObjectId.isValid(reviewId)) return NextResponse.json({ success: false, error: 'Invalid review update' }, { status: 400 })
    const db = await getDb()

    const client = await clientPromise
    const session = client.startSession()
    let updatedReview = null
    try {
      await session.withTransaction(async () => {
        const review = await db.collection('reviews').findOne({ _id: new ObjectId(reviewId) }, { session })
        if (!review) return
        await db.collection('reviews').updateOne(
          { _id: review._id },
          { $set: { visible, updatedAt: new Date() } },
          { session }
        )
        await recalculatePlaceReviewStats(db, review.placeId, session)
        updatedReview = await db.collection('reviews').findOne({ _id: review._id }, { session })
      })
    } finally {
      await session.endSession()
    }
    if (!updatedReview) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: visible ? 'review.show' : 'review.hide',
      target: 'review', targetId: reviewId,
    })

    return NextResponse.json({ success: true, data: updatedReview })
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 })
  }
}

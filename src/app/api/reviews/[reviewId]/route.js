import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'

// DELETE /api/reviews/[reviewId] — owner deletes own, admin deletes any
export async function DELETE(request, { params }) {
  try {
    const { reviewId } = await params
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const db = await getDb()
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(reviewId) })
    if (!review) return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })

    const isOwner = review.userId?.toString() === user._id.toString()
    if (!isOwner && user.role !== 'admin') return forbidden('You can only delete your own reviews')

    await db.collection('reviews').deleteOne({ _id: new ObjectId(reviewId) })

    // Recalculate rating
    const remaining = await db.collection('reviews')
      .find({ placeId: review.placeId, visible: true })
      .toArray()
    const avgRating = remaining.length
      ? remaining.reduce((s, r) => s + (r.rating || 0), 0) / remaining.length
      : 0
    await db.collection('places').updateOne(
      { _id: review.placeId },
      { $set: { rating: Math.round(avgRating * 10) / 10, reviewCount: remaining.length } }
    )

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
    if (user.role !== 'admin') return forbidden('Only admins can toggle review visibility')

    const { visible } = await request.json()
    const db = await getDb()

    const result = await db.collection('reviews').findOneAndUpdate(
      { _id: new ObjectId(reviewId) },
      { $set: { visible: Boolean(visible), updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: visible ? 'review.show' : 'review.hide',
      target: 'review', targetId: reviewId,
    })

    return NextResponse.json({ success: true, data: result })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 })
  }
}

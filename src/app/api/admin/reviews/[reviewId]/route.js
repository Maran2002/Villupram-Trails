import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'

export async function PUT(request, { params }) {
  try {
    const { reviewId } = await params
    if (!ObjectId.isValid(reviewId)) {
      return NextResponse.json({ success: false, error: 'Invalid review ID' }, { status: 400 })
    }

    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (user.role !== 'admin') return forbidden()

    const body = await request.json()
    const { comment, rating, visible } = body

    const db = await getDb()
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(reviewId) })
    
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
    }

    const update = { $set: { updatedAt: new Date() } }
    if (comment !== undefined) update.$set.comment = comment
    if (rating !== undefined)  update.$set.rating = Number(rating)
    if (visible !== undefined) update.$set.visible = visible

    const result = await db.collection('reviews').findOneAndUpdate(
      { _id: new ObjectId(reviewId) },
      update,
      { returnDocument: 'after' }
    )

    // Re-calculate place rating if needed
    if (rating !== undefined || visible !== undefined) {
      const allVisible = await db.collection('reviews')
        .find({ placeId: review.placeId, visible: true })
        .toArray()
      
      const avgRating = allVisible.length
        ? allVisible.reduce((s, r) => s + (r.rating || 0), 0) / allVisible.length
        : 0

      await db.collection('places').updateOne(
        { _id: review.placeId },
        { $set: { rating: Math.round(avgRating * 10) / 10, reviewCount: allVisible.length } }
      )
    }

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'review.admin_edit', target: 'review', targetId: reviewId,
      meta: { placeId: review.placeId, oldVisible: review.visible, newVisible: visible }
    })

    return NextResponse.json({ success: true, data: result })
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
    if (user.role !== 'admin') return forbidden()

    const db = await getDb()
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(reviewId) })
    
    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 })
    }

    await db.collection('reviews').deleteOne({ _id: new ObjectId(reviewId) })

    // Update place stats
    const allVisible = await db.collection('reviews')
      .find({ placeId: review.placeId, visible: true })
      .toArray()
    
    const avgRating = allVisible.length
      ? allVisible.reduce((s, r) => s + (r.rating || 0), 0) / allVisible.length
      : 0

    await db.collection('places').updateOne(
      { _id: review.placeId },
      { $set: { rating: Math.round(avgRating * 10) / 10, reviewCount: allVisible.length } }
    )

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

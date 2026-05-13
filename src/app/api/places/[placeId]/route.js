import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthUser, verifyToken, unauthorized, forbidden, writeAudit } from '@/lib/auth'
import { buildPlacePatch } from '@/lib/schemas'

export async function GET(request, { params }) {
  try {
    const { placeId } = await params
    if (!ObjectId.isValid(placeId)) {
      return NextResponse.json({ success: false, error: 'Invalid place ID' }, { status: 400 })
    }
    const db      = await getDb()
    const decoded = verifyToken(request)
    const place   = await db.collection('places').findOne({ _id: new ObjectId(placeId) })

    if (!place) return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 })

    if (place.status !== 'Approved') {
      if (!decoded) return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 })
      const isOwner = place.submittedBy?.userId?.toString() === decoded.userId?.toString()
      if (!isOwner && decoded.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ success: true, data: place })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch place' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { placeId } = await params
    if (!ObjectId.isValid(placeId)) {
      return NextResponse.json({ success: false, error: 'Invalid place ID' }, { status: 400 })
    }

    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const db    = await getDb()
    const place = await db.collection('places').findOne({ _id: new ObjectId(placeId) })
    if (!place) return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 })

    const isOwner = place.submittedBy?.userId?.toString() === user._id.toString()
    const isAdmin = user.role === 'admin'
    if (!isOwner && !isAdmin) return forbidden('You can only edit your own places')

    const body = await request.json()
    const { patch, errors } = buildPlacePatch(body, { isAdmin })

    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join('; ') }, { status: 422 })
    }

    let update = {}
    let action = isAdmin ? 'place.admin_edit' : 'place.edit'

    if (isAdmin) {
      // Admins can overwrite everything directly
      update = { $set: patch, $unset: { pendingUpdate: "" } }
    } else {
      if (place.status === 'Approved') {
        // If Approved, store as pending update to keep live version unchanged
        update = { $set: { pendingUpdate: { ...patch, requestedAt: new Date() } } }
        action = 'place.update_request'
      } else {
        // If not Approved yet, just overwrite and keep/set status to Pending
        patch.status = 'Pending'
        update = { $set: patch }
      }
    }

    const result = await db.collection('places').findOneAndUpdate(
      { _id: new ObjectId(placeId) },
      update,
      { returnDocument: 'after' }
    )

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: action,
      target: 'place', targetId: placeId,
      meta: { name: place.name },
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update place' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { placeId } = await params
    if (!ObjectId.isValid(placeId)) {
      return NextResponse.json({ success: false, error: 'Invalid place ID' }, { status: 400 })
    }

    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (user.role !== 'admin') return forbidden('Only admins can delete places')

    const db    = await getDb()
    const place = await db.collection('places').findOne({ _id: new ObjectId(placeId) })
    if (!place) return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 })

    await db.collection('places').deleteOne({ _id: new ObjectId(placeId) })
    await db.collection('reviews').deleteMany({ placeId: new ObjectId(placeId) })

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'place.delete', target: 'place', targetId: placeId,
      meta: { name: place.name },
    })

    return NextResponse.json({ success: true, message: 'Deleted successfully' })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete place' }, { status: 500 })
  }
}

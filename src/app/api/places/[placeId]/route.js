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

    // Non-admin edits go back to Pending for re-approval
    if (!isAdmin) patch.status = 'Pending'

    const result = await db.collection('places').findOneAndUpdate(
      { _id: new ObjectId(placeId) },
      { $set: patch },
      { returnDocument: 'after' }
    )

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: isAdmin ? 'place.admin_edit' : 'place.edit',
      target: 'place', targetId: placeId,
      meta: { name: place.name, newStatus: patch.status || place.status },
    })

    return NextResponse.json({ success: true, data: result })
  } catch {
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

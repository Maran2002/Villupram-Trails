import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'approvals', 'view')) return forbidden()

    const db = await getDb()
    // Fetch places that are Pending OR have a pendingUpdate
    const pendingPlaces = await db.collection('places').find({
      $or: [
        { status: 'Pending' },
        { pendingUpdate: { $exists: true } }
      ]
    }).toArray()
    
    const hiddenReviews = await db.collection('reviews').find({ visible: false }).toArray()

    const items = [
      ...pendingPlaces.map(p => ({ 
        ...p, 
        type: 'Place', 
        isUpdate: p.status === 'Approved' && !!p.pendingUpdate 
      })),
      ...hiddenReviews.map(r => ({ ...r, type: 'Review' })),
    ]

    return NextResponse.json({ success: true, data: items })
  } catch (error) {
    console.error('Fetch approvals error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch approvals' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'approvals', 'edit')) return forbidden()

    const { itemId, type, action } = await request.json()
    const db = await getDb()

    let result
    if (type === 'Place') {
      const place = await db.collection('places').findOne({ _id: new ObjectId(itemId) })
      if (!place) return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 })

      if (place.pendingUpdate && action === 'approve') {
        // Approve an update to an existing record
        const { requestedAt, ...updateData } = place.pendingUpdate
        result = await db.collection('places').findOneAndUpdate(
          { _id: new ObjectId(itemId) },
          { 
            $set: { ...updateData, updatedAt: new Date() },
            $unset: { pendingUpdate: "" }
          },
          { returnDocument: 'after' }
        )
      } else if (place.pendingUpdate && action === 'reject') {
        // Reject an update (keep current approved version, just clear the request)
        result = await db.collection('places').findOneAndUpdate(
          { _id: new ObjectId(itemId) },
          { $unset: { pendingUpdate: "" } },
          { returnDocument: 'after' }
        )
      } else {
        // Standard Pending -> Approved/Rejected flow
        const newStatus = action === 'approve' ? 'Approved' : 'Rejected'
        result = await db.collection('places').findOneAndUpdate(
          { _id: new ObjectId(itemId) },
          { $set: { status: newStatus, updatedAt: new Date() } },
          { returnDocument: 'after' }
        )
      }
    } else {
      // Review visibility toggle
      const visible = action === 'approve'
      result = await db.collection('reviews').findOneAndUpdate(
        { _id: new ObjectId(itemId) },
        { $set: { visible, updatedAt: new Date() } },
        { returnDocument: 'after' }
      )
    }

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: `${type.toLowerCase()}.${action}`,
      target: type.toLowerCase(), targetId: itemId,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Process approval error:', error)
    return NextResponse.json({ success: false, error: 'Failed to process action' }, { status: 500 })
  }
}

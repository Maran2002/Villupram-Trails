import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (user.role !== 'admin') return forbidden()

    const db = await getDb()
    const pendingPlaces = await db.collection('places').find({ status: 'Pending' }).toArray()
    const hiddenReviews = await db.collection('reviews').find({ visible: false }).toArray()

    const items = [
      ...pendingPlaces.map(p => ({ ...p, type: 'Place' })),
      ...hiddenReviews.map(r => ({ ...r, type: 'Review' })),
    ]

    return NextResponse.json({ success: true, data: items })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch approvals' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (user.role !== 'admin') return forbidden()

    const { itemId, type, action } = await request.json()
    const db = await getDb()

    let result
    if (type === 'Place') {
      const newStatus = action === 'approve' ? 'Approved' : 'Rejected'
      result = await db.collection('places').findOneAndUpdate(
        { _id: new ObjectId(itemId) },
        { $set: { status: newStatus, updatedAt: new Date() } },
        { returnDocument: 'after' }
      )
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

    return NextResponse.json({ success: true, data: result })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to process action' }, { status: 500 })
  }
}

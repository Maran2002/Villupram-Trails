import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'reports', 'view')) return forbidden()

    const db = await getDb()
    const reports = await db.collection('reports')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ success: true, data: reports })
  } catch (error) {
    console.error('Fetch admin reports error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'reports', 'edit')) return forbidden()

    const body = await request.json()
    const { id, status, actionTaken, actionReason } = body

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.collection('reports').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status, 
          actionTaken, 
          actionReason,
          updatedAt: new Date()
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 })
    }

    await writeAudit({
      userId: user._id,
      username: user.username,
      role: user.role,
      action: 'report.update',
      target: 'report',
      targetId: id,
      meta: { status, actionTaken }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update report error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

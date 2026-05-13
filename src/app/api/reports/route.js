import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, writeAudit } from '@/lib/auth'
import { ObjectId } from 'mongodb'

// GET: User's own reports (Authenticated)
export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const db = await getDb()
    const reports = await db.collection('reports')
      .find({ reporterId: user._id })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ success: true, data: reports })
  } catch (error) {
    console.error('Fetch user reports error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST: Create a report (Authenticated or Guest)
export async function POST(request) {
  try {
    const user = await getAuthUser(request)
    const body = await request.json()
    const { type, targetId, reason, description, email, name } = body

    if (!type || !reason || !description) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }

    const db = await getDb()
    
    const newReport = {
      type, // 'review', 'place', 'user', 'other'
      targetId: targetId ? targetId : null,
      reason,
      description,
      status: 'pending', // 'pending', 'open', 'closed'
      actionTaken: '',
      actionReason: '',
      reporterId: user ? user._id : null,
      reporterName: user ? user.username : (name || 'Guest'),
      reporterEmail: user ? user.email : (email || 'anonymous'),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('reports').insertOne(newReport)

    if (user) {
      await writeAudit({
        userId: user._id,
        username: user.username,
        role: user.role,
        action: 'report.create',
        target: type,
        targetId: targetId || result.insertedId.toString(),
        meta: { reason, reportId: result.insertedId.toString() }
      })
    }

    return NextResponse.json({ success: true, data: { ...newReport, _id: result.insertedId } })
  } catch (error) {
    console.error('Create report error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

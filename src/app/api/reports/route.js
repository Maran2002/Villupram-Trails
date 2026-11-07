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
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Invalid report data' }, { status: 400 })
    }
    const { type, targetId, reason, description, email, name } = body

    if (!['review', 'place', 'user', 'other'].includes(type)
      || typeof reason !== 'string' || !reason.trim() || reason.length > 80
      || typeof description !== 'string' || description.trim().length < 5 || description.length > 5000) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }
    if (type !== 'other' && !targetId) {
      return NextResponse.json({ success: false, error: 'A target is required for this report type' }, { status: 400 })
    }
    if (targetId && !ObjectId.isValid(targetId)) return NextResponse.json({ success: false, error: 'Invalid target ID' }, { status: 400 })
    if (!user && email && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return NextResponse.json({ success: false, error: 'Invalid email address' }, { status: 400 })
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
      reporterName: user ? user.username : (typeof name === 'string' ? name.trim().slice(0, 100) : 'Guest'),
      reporterEmail: user ? user.email : (typeof email === 'string' ? email.trim().toLowerCase().slice(0, 254) : 'anonymous'),
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

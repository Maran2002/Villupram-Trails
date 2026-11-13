import { readJson, requestBodyError } from '@/lib/requestJson'
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

    const { searchParams } = new URL(request.url)
    const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10)
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '20', 10)
    const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1
    const limit = Number.isFinite(requestedLimit) ? Math.min(50, Math.max(1, requestedLimit)) : 20
    const status = searchParams.get('status')
    const search = (searchParams.get('search') || '').trim().slice(0, 100)
    const query = {}
    if (['pending', 'open', 'closed'].includes(status)) query.status = status
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      query.$or = ['reporterName', 'reporterEmail', 'type', 'reason', 'description', 'targetId']
        .map((field) => ({ [field]: { $regex: escaped, $options: 'i' } }))
    }

    const db = await getDb()
    const collection = db.collection('reports')
    const [reports, total] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      collection.countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: reports,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    })
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

    const body = await readJson(request)
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
    }
    const { id, status, actionTaken, actionReason } = body

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
    }
    if (!ObjectId.isValid(id) || !['pending', 'open', 'closed'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid report ID or status' }, { status: 400 })
    }
    if ((actionTaken !== undefined && (typeof actionTaken !== 'string' || actionTaken.length > 500))
      || (actionReason !== undefined && (typeof actionReason !== 'string' || actionReason.length > 2000))) {
      return NextResponse.json({ success: false, error: 'Action text is too long or invalid' }, { status: 400 })
    }

    const db = await getDb()
    const result = await db.collection('reports').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status, 
          actionTaken: typeof actionTaken === 'string' ? actionTaken.trim() : '',
          actionReason: typeof actionReason === 'string' ? actionReason.trim() : '',
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
      meta: { status, actionTaken: typeof actionTaken === 'string' ? actionTaken.trim() : '' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    console.error('Update report error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

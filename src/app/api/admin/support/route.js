import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'support', 'view')) return forbidden()

    const { searchParams } = new URL(request.url)
    const page   = Math.max(1, parseInt(searchParams.get('page')) || 1)
    const limit  = Math.min(50, parseInt(searchParams.get('limit')) || 20)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const db = await getDb()
    const query = {}

    if (status && status !== 'all') query.status = status
    if (search) {
      query.$or = [
        { name:    { $regex: search, $options: 'i' } },
        { email:   { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { topic:   { $regex: search, $options: 'i' } },
      ]
    }

    const [tickets, total] = await Promise.all([
      db.collection('support_tickets')
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
      db.collection('support_tickets').countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: tickets,
      meta: { total, page, limit, pages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Fetch support tickets error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch tickets' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'support', 'edit')) return forbidden()

    const { id, status } = await request.json()
    if (!ObjectId.isValid(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })

    const db = await getDb()
    const result = await db.collection('support_tickets').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    if (!result) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'support.update_status',
      target: 'support', targetId: id,
      meta: { newStatus: status }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Update support ticket error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update ticket' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'support', 'delete')) return forbidden()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!ObjectId.isValid(id)) return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 })

    const db = await getDb()
    const result = await db.collection('support_tickets').deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 })

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'support.delete',
      target: 'support', targetId: id,
    })

    return NextResponse.json({ success: true, message: 'Ticket deleted successfully' })
  } catch (error) {
    console.error('Delete support ticket error:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete ticket' }, { status: 500 })
  }
}

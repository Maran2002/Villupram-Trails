import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { verifyToken, getAuthUser, unauthorized, writeAudit } from '@/lib/auth'
import { buildPlaceDoc, VALID_CATEGORIES } from '@/lib/schemas'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page     = Math.max(1, parseInt(searchParams.get('page'))  || 1)
    const limit    = Math.min(50, parseInt(searchParams.get('limit')) || 12)
    const category = searchParams.get('category')
    const search   = searchParams.get('search')
    const day      = searchParams.get('day')   // e.g. 'Mon'
    const featured = searchParams.get('featured')
    const trending = searchParams.get('trending')

    const db      = await getDb()
    const decoded = verifyToken(request)

    const query = {}
    // Non-admins only see Approved places
    if (!decoded || decoded.role !== 'admin') query.status = 'Approved'

    if (category && category !== 'all' && VALID_CATEGORIES.includes(category)) {
      query.category = category
    }
    if (featured === 'true') query.isFeatured = true
    if (trending === 'true') query.isTrending = true

    if (search) {
      query.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }
    // Filter by open day
    if (day) query['visitingHoursMeta.days'] = day

    const [places, total] = await Promise.all([
      db.collection('places').find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray(),
      db.collection('places').countDocuments(query),
    ])

    return NextResponse.json({
      success: true,
      data: { items: places, total, page, limit, pages: Math.ceil(total / limit) }
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch places' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const db     = await getDb()
    const settings = await db.collection('settings').findOne({ _id: 'site_config' })
    const body = await request.json()
    
    // Admins always force Approved. 
    // Users depend on the requirePlaceApproval setting (if setting is false, force Approved).
    let forceStatus = undefined
    if (user.role === 'admin') {
      forceStatus = 'Approved'
    } else if (settings?.requirePlaceApproval === false) {
      forceStatus = 'Approved'
    }

    const { doc, errors } = buildPlaceDoc(body, user, forceStatus)

    if (errors.length) {
      return NextResponse.json({ success: false, error: errors.join('; ') }, { status: 422 })
    }

    const result = await db.collection('places').insertOne(doc)

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'place.create', target: 'place',
      targetId: result.insertedId,
      meta: { name: doc.name, status: doc.status },
    })

    await db.collection('users').updateOne(
      { _id: user._id },
      { $inc: { 'contributions.placesAdded': 1 } }
    )

    return NextResponse.json(
      { success: true, data: { ...doc, _id: result.insertedId } },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to create place' }, { status: 500 })
  }
}

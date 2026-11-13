import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getAuthUser, unauthorized } from '@/lib/auth'
import { getDb } from '@/lib/mongodb'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('placeId')
    const db = await getDb()

    if (placeId) {
      if (!ObjectId.isValid(placeId)) return NextResponse.json({ success: false, error: 'Invalid place ID' }, { status: 400 })
      const saved = await db.collection('favorites').findOne({ userId: user._id, placeId: new ObjectId(placeId) })
      return NextResponse.json({ success: true, data: { saved: Boolean(saved) } })
    }

    const favorites = await db.collection('favorites').find({ userId: user._id }).sort({ createdAt: -1 }).toArray()
    const placeIds = favorites.map((favorite) => favorite.placeId)
    const places = placeIds.length
      ? await db.collection('places').find({ _id: { $in: placeIds }, status: 'Approved' }, { projection: { images: { $slice: 1 } } }).toArray()
      : []
    const placesById = new Map(places.map((place) => [place._id.toString(), place]))
    return NextResponse.json({ success: true, data: placeIds.map((id) => placesById.get(id.toString())).filter(Boolean) })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch saved places' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const { placeId } = await readJson(request)
    if (!ObjectId.isValid(placeId)) return NextResponse.json({ success: false, error: 'Invalid place ID' }, { status: 400 })

    const db = await getDb()
    const placeObjectId = new ObjectId(placeId)
    const place = await db.collection('places').findOne({ _id: placeObjectId, status: 'Approved' }, { projection: { _id: 1 } })
    if (!place) return NextResponse.json({ success: false, error: 'Place not found' }, { status: 404 })

    await db.collection('favorites').updateOne(
      { userId: user._id, placeId: placeObjectId },
      { $setOnInsert: { userId: user._id, placeId: placeObjectId, createdAt: new Date() } },
      { upsert: true }
    )
    return NextResponse.json({ success: true, data: { saved: true } })
  } catch (error) {
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    return NextResponse.json({ success: false, error: 'Failed to save place' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const { searchParams } = new URL(request.url)
    const placeId = searchParams.get('placeId')
    if (!ObjectId.isValid(placeId)) return NextResponse.json({ success: false, error: 'Invalid place ID' }, { status: 400 })

    const db = await getDb()
    await db.collection('favorites').deleteOne({ userId: user._id, placeId: new ObjectId(placeId) })
    return NextResponse.json({ success: true, data: { saved: false } })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to remove saved place' }, { status: 500 })
  }
}

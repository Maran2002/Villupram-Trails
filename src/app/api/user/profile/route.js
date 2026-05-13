import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { getAuthUser, unauthorized, writeAudit } from '@/lib/auth'

export async function PUT(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const body = await request.json()
    const { username, email, profileImage, bio, location } = body

    const db = await getDb()

    // Validate if username/email already taken by another user
    if (username && username !== user.username) {
      const existing = await db.collection('users').findOne({ username, _id: { $ne: user._id } })
      if (existing) return NextResponse.json({ success: false, error: 'Username already taken' }, { status: 400 })
    }
    if (email && email !== user.email) {
      const existing = await db.collection('users').findOne({ email, _id: { $ne: user._id } })
      if (existing) return NextResponse.json({ success: false, error: 'Email already registered' }, { status: 400 })
    }

    const updateData = {
      updatedAt: new Date()
    }
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (profileImage !== undefined) updateData.profileImage = profileImage
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location

    const result = await db.collection('users').findOneAndUpdate(
      { _id: user._id },
      { $set: updateData },
      { returnDocument: 'after' }
    )

    // Remove sensitive data
    const { password, ...safeUser } = result

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'user.update_profile',
      target: 'user', targetId: user._id.toString(),
      meta: { fields: Object.keys(updateData) }
    })

    return NextResponse.json({ success: true, data: safeUser })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()

    const db = await getDb()
    const userData = await db.collection('users').findOne({ _id: user._id }, { projection: { password: 0 } })

    return NextResponse.json({ success: true, data: userData })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 })
  }
}

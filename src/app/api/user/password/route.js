import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import { getAuthUser, unauthorized, writeAudit } from '@/lib/auth'

export async function PUT(request) {
  try {
    const userSession = await getAuthUser(request)
    if (!userSession) return unauthorized()

    const { oldPassword, newPassword } = await request.json()
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Both old and new passwords are required' }, { status: 400 })
    }

    const db = await getDb()
    const user = await db.collection('users').findOne({ _id: userSession._id })
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ success: false, error: 'Incorrect old password' }, { status: 401 })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword, updatedAt: new Date() } }
    )

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'user.change_password',
      target: 'user', targetId: user._id.toString(),
    })

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update password' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getAuthUser, getJwtSecret, unauthorized, writeAudit } from '@/lib/auth'

export async function PUT(request) {
  try {
    const userSession = await getAuthUser(request)
    if (!userSession) return unauthorized()
    const jwtSecret = getJwtSecret()

    const { oldPassword, newPassword } = await request.json()
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Both old and new passwords are required' }, { status: 400 })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 12) {
      return NextResponse.json({ success: false, error: 'New password must be at least 12 characters' }, { status: 422 })
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

    const updatedUser = await db.collection('users').findOneAndUpdate(
      { _id: user._id },
      { $set: { password: hashedPassword, updatedAt: new Date() }, $inc: { sessionVersion: 1 } },
      { returnDocument: 'after' }
    )

    const token = jwt.sign(
      {
        userId: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role || 'user',
        ...(updatedUser.role === 'admin' ? { adminSession: true } : {}),
        sessionVersion: updatedUser.sessionVersion,
      },
      jwtSecret,
      { expiresIn: updatedUser.role === 'admin' ? '1h' : '7d' }
    )

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'user.change_password',
      target: 'user', targetId: user._id.toString(),
    })

    const response = NextResponse.json({ success: true, message: 'Password updated successfully' })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: updatedUser.role === 'admin' ? 60 * 60 : 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update password' }, { status: 500 })
  }
}

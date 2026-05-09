import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { email, password, username } = await request.json()
    const db = await getDb()

    const existingUser = await db.collection('users').findOne({ $or: [{ email }, { username }] })
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email or username already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    const newUser = {
      email,
      username,
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      contributions: { placesAdded: 0, reviewsWritten: 0, photosUploaded: 0 },
      createdAt: new Date()
    }

    const result = await db.collection('users').insertOne(newUser)

    const token = jwt.sign(
      { userId: result.insertedId, email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json(
      { success: true, data: { token, user: { ...userWithoutPassword, _id: result.insertedId } } },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to register account' },
      { status: 500 }
    )
  }
}

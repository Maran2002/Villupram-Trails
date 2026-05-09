import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET(request) {
  try {
    const db = await getDb()

    const users = await db.collection('users')
      .find({}, { projection: { password: 0 } })
      .toArray()

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

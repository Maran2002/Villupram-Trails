import { NextResponse } from 'next/server'
import { getAuthUser, unauthorized } from '@/lib/auth'
import { isSuperAdmin } from '@/lib/permissions'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized('Invalid or expired session')
    return NextResponse.json({ success: true, data: { ...user, isSuperAdmin: isSuperAdmin(user) } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch current user' },
      { status: 500 }
    )
  }
}

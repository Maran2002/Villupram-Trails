import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'settings', 'view')) return forbidden()

    const db = await getDb()
    let settings = await db.collection('settings').findOne({ _id: 'site_config' })

    if (!settings) {
      // Default settings
      settings = {
        _id: 'site_config',
        siteName: 'Villupuram Hub',
        siteLogo: '',
        contactEmail: 'contact@villupuramhub.com',
        contactPhone: '+91 98765 43210',
        address: 'Villupuram, Tamil Nadu, India',
        socialLinks: {
          facebook: '',
          twitter: '',
          instagram: '',
          youtube: ''
        },
        seoDescription: 'Discover the hidden gems, heritage, and culture of Villupuram.',
        requirePlaceApproval: true,
        requireReviewApproval: false,
        updatedAt: new Date()
      }
      await db.collection('settings').insertOne(settings)
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (!hasPermission(user, 'settings', 'edit')) return forbidden()

    const body = await request.json()
    const { _id, ...updateData } = body
    
    const db = await getDb()
    await db.collection('settings').updateOne(
      { _id: 'site_config' },
      { $set: { ...updateData, updatedAt: new Date() } },
      { upsert: true }
    )

    await writeAudit({
      userId: user._id, username: user.username, role: user.role,
      action: 'admin.update_settings',
      target: 'settings', targetId: 'site_config',
      meta: { updatedFields: Object.keys(updateData) }
    })

    return NextResponse.json({ success: true, message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 })
  }
}

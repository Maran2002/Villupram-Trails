import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDb()
    const settings = await db.collection('settings').findOne({ _id: 'site_config' })

    if (!settings) {
      return NextResponse.json({ 
        success: true, 
        data: {
          siteName: 'Villupuram Hub',
          siteLogo: '',
          contactEmail: 'contact@villupuramhub.com',
          contactPhone: '+91 98765 43210',
          address: 'Villupuram, Tamil Nadu, India',
          socialLinks: { facebook: '', twitter: '', instagram: '', youtube: '' },
          seoDescription: 'Discover the hidden gems, heritage, and culture of Villupuram.'
        }
      })
    }

    return NextResponse.json({ success: true, data: settings })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch public settings' }, { status: 500 })
  }
}

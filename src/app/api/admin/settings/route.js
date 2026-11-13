import { readJson, requestBodyError } from '@/lib/requestJson'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden, writeAudit } from '@/lib/auth'
import { filterImages } from '@/lib/schemas'
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
        siteName: 'Oor Thadam',
        siteLogo: '/images/oor-thadam-logo.png',
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
        requireReviewApproval: false,
        updatedAt: new Date()
      }
      settings = await db.collection('settings').findOneAndUpdate(
        { _id: 'site_config' }, { $setOnInsert: settings },
        { upsert: true, returnDocument: 'after' }
      )
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

    const body = await readJson(request, 1536 * 1024)
    const updateData = {}
    const invalid = (field) => NextResponse.json(
      { success: false, error: `Invalid ${field}` }, { status: 422 }
    )
    const limits = { siteName: 80, contactEmail: 254, contactPhone: 40, address: 300, seoDescription: 320 }
    for (const [field, max] of Object.entries(limits)) {
      if (!Object.hasOwn(body, field)) continue
      if (typeof body[field] !== 'string' || body[field].length > max) return invalid(field)
      updateData[field] = body[field].trim()
    }
    if (updateData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.contactEmail)) {
      return invalid('contact email')
    }
    if (Object.hasOwn(body, 'siteLogo')) {
      if (body.siteLogo !== '' && body.siteLogo !== '/images/oor-thadam-logo.png' && !filterImages([body.siteLogo]).length) return invalid('site logo')
      updateData.siteLogo = body.siteLogo
    }
    if (Object.hasOwn(body, 'requireReviewApproval')) {
      if (typeof body.requireReviewApproval !== 'boolean') return invalid('review approval setting')
      updateData.requireReviewApproval = body.requireReviewApproval
    }
    if (Object.hasOwn(body, 'socialLinks')) {
      const links = body.socialLinks
      if (!links || typeof links !== 'object' || Array.isArray(links)) return invalid('social links')
      for (const network of ['facebook', 'twitter', 'instagram', 'youtube']) {
        if (!Object.hasOwn(links, network)) continue
        const url = links[network]
        if (typeof url !== 'string' || url.length > 2048) return invalid(network + ' link')
        if (url) {
          try {
            if (new URL(url).protocol !== 'https:') return invalid(network + ' link')
          } catch {
            return invalid(network + ' link')
          }
        }
        updateData[`socialLinks.${network}`] = url
      }
    }

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
    const bodyError = requestBodyError(error)
    if (bodyError) return bodyError
    console.error('Update settings error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 })
  }
}

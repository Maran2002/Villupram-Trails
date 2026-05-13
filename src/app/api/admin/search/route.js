import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getAuthUser, unauthorized, forbidden } from '@/lib/auth'

const sidebarItems = [
  { title: 'Overview', subtitle: 'Dashboard Analytics', href: '/admin', type: 'page' },
  { title: 'Visitor Logs', subtitle: 'Traffic and logs', href: '/admin/logs', type: 'page' },
  { title: 'Places', subtitle: 'Manage locations', href: '/admin/places', type: 'page' },
  { title: 'Reviews', subtitle: 'User feedback', href: '/admin/reviews', type: 'page' },
  { title: 'Contributors', subtitle: 'Manage users', href: '/admin/contributors', type: 'page' },
  { title: 'Approvals', subtitle: 'Pending content', href: '/admin/approvals', type: 'page' },
  { title: 'Audit Trail', subtitle: 'Security logs', href: '/admin/audit', type: 'page' },
  { title: 'Settings', subtitle: 'Site config', href: '/admin/settings', type: 'page' },
]

export async function GET(request) {
  try {
    const user = await getAuthUser(request)
    if (!user) return unauthorized()
    if (user.role !== 'admin') return forbidden()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: [] })
    }

    const db = await getDb()
    const regex = new RegExp(q, 'i')

    // 1. Filter Sidebar Items
    const pageResults = sidebarItems
      .filter(item => item.title.match(regex) || item.subtitle.match(regex))
      .map(item => ({ ...item, id: item.href }))

    // 2. Search Places
    const places = await db.collection('places')
      .find({ 
        $or: [{ name: regex }, { category: regex }] 
      })
      .limit(3)
      .toArray()

    // 3. Search Users
    const users = await db.collection('users')
      .find({ 
        $or: [{ username: regex }, { email: regex }] 
      })
      .limit(3)
      .toArray()

    // 4. Search Reviews
    const reviews = await db.collection('reviews')
      .find({ 
        $or: [{ comment: regex }, { userName: regex }, { placeName: regex }] 
      })
      .limit(3)
      .toArray()

    const results = [
      ...pageResults,
      ...places.map(p => ({
        id: p._id,
        type: 'place',
        title: p.name,
        subtitle: `Place · ${p.category}`,
        href: `/admin/places?search=${encodeURIComponent(p.name)}`
      })),
      ...users.map(u => ({
        id: u._id,
        type: 'user',
        title: u.username,
        subtitle: `User · ${u.role}`,
        href: `/admin/contributors?search=${encodeURIComponent(u.username)}`
      })),
      ...reviews.map(r => ({
        id: r._id,
        type: 'review',
        title: `Review by ${r.userName}`,
        subtitle: `Review on ${r.placeName}`,
        href: `/admin/reviews?search=${encodeURIComponent(r.userName)}`
      }))
    ]

    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('Admin search error:', error)
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 })
  }
}

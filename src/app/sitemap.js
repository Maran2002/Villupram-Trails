import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'

export const revalidate = 3600

const staticPaths = [
  '/', '/about', '/accessibility', '/contact', '/cookies', '/explore',
  '/faq', '/guidelines', '/privacy', '/terms',
]

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!siteUrl) return []

  let baseUrl
  try {
    baseUrl = new URL(siteUrl)
    if (baseUrl.protocol !== 'https:' && process.env.NODE_ENV === 'production') return []
  } catch {
    return []
  }

  const lastModified = new Date()
  const entries = staticPaths.map((path) => ({
    url: new URL(path, baseUrl).toString(),
    lastModified,
  }))

  try {
    const db = await getDb()
    const places = await db.collection('places')
      .find({ status: 'Approved' }, { projection: { _id: 1, updatedAt: 1, createdAt: 1 } })
      .toArray()
    entries.push(...places.map((place) => ({
      url: new URL(`/explore/${new ObjectId(place._id).toString()}`, baseUrl).toString(),
      lastModified: place.updatedAt || place.createdAt || lastModified,
    })))
  } catch {
    // Keep the static public URLs available if the optional content database is offline.
  }

  return entries
}

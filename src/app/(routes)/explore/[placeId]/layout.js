import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'

export async function generateMetadata({ params }) {
  const { placeId } = await params
  if (!ObjectId.isValid(placeId)) return { title: 'Destination not found', robots: { index: false, follow: false } }

  try {
    const db = await getDb()
    const place = await db.collection('places').findOne(
      { _id: new ObjectId(placeId), status: 'Approved' },
      { projection: { name: 1, description: 1, images: 1 } }
    )
    if (!place) return { title: 'Destination not found', robots: { index: false, follow: false } }

    const description = (place.description || `Explore ${place.name} in Villupuram District, Tamil Nadu.`).slice(0, 160)
    const metadata = {
      title: place.name,
      description,
      alternates: { canonical: `/explore/${placeId}` },
      openGraph: { type: 'article', title: place.name, description, url: `/explore/${placeId}` },
      twitter: { card: 'summary_large_image', title: place.name, description },
    }
    const image = place.images?.find((url) => typeof url === 'string' && url.startsWith('https://'))
    if (image) {
      metadata.openGraph.images = [{ url: image }]
      metadata.twitter.images = [image]
    }
    return metadata
  } catch {
    return { title: 'Villupuram destination', robots: { index: false, follow: true } }
  }
}

export default function PlaceRouteLayout({ children }) { return children }

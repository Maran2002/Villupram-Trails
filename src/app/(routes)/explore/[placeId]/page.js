'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/common/Button'
import { Share2, Bookmark } from 'lucide-react'
import { usePlace } from '@/lib/hooks/usePlaces'

// Basic placeholders for missing components to ensure it runs
const PlaceGallery = ({ images }) => (
  <div className="h-96 bg-neutral-200 dark:bg-dark-800 w-full relative">
    {images?.[0] ? <Image src={images[0]} alt="Gallery" fill className="object-cover" /> : <div className="p-8">No images</div>}
  </div>
)
const PlaceInfoCards = ({ place }) => <div className="grid grid-cols-3 gap-4 my-8"><div className="p-4 bg-neutral-100 dark:bg-dark-800 rounded">Rating: {place?.rating || 0} ({place?.reviewCount || 0} reviews)</div></div>
const PlaceMap = ({ location }) => <div className="h-64 bg-neutral-200 dark:bg-dark-800 rounded mt-4 flex items-center justify-center text-center p-4">{location?.address || 'Map View'}</div>
const PlaceReviews = () => <div className="mt-8"><h3 className="font-bold mb-4">Reviews</h3><p>No reviews yet.</p></div>

export default function PlaceDetail({ params }) {
  const { placeId } = use(params)
  const { data: place, loading, error } = usePlace(placeId)

  if (loading) return <div className="min-h-screen flex justify-center items-center">Loading place details...</div>
  if (error || !place) return <div className="min-h-screen flex justify-center items-center text-red-500">Failed to load place details.</div>

  return (
    <div className="min-h-screen">
      {/* Hero Gallery */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <PlaceGallery images={place?.images || []} />
      </motion.section>

      {/* Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="mb-8 flex justify-between items-start flex-wrap gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">{place?.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="badge px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm capitalize">{place?.category}</span>
              {place?.updatedAt && <span className="text-neutral-500 text-sm">Last updated: {new Date(place.updatedAt).toLocaleDateString()}</span>}
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="md">
              <Share2 size={18} /> Share
            </Button>
            <Button variant="outline" size="md">
              <Bookmark size={18} /> Save
            </Button>
          </div>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PlaceInfoCards place={place} />
        </motion.div>

        {/* Description */}
        <motion.section
          className="my-12 grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif font-bold mb-4">About This Place</h2>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8 whitespace-pre-wrap">
              {place?.fullDescription || place?.description || 'No description available.'}
            </p>
            <PlaceMap location={place?.location} />
          </div>
          <aside className="lg:col-span-1">
            <PlaceReviews placeId={place._id} />
          </aside>
        </motion.section>
      </div>
    </div>
  )
}

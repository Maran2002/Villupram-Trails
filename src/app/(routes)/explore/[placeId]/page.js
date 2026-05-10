'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/common/Button'
import { Share2, Bookmark } from 'lucide-react'
import { usePlace } from '@/lib/hooks/usePlaces'

// Basic placeholders for missing components to ensure it runs
const PlaceGallery = ({ images }) => (
  <div className="h-[50vh] min-h-[400px] bg-neutral-200 dark:bg-dark-800 w-full relative overflow-hidden group">
    {images?.[0] ? (
      <Image 
        src={images[0]} 
        alt="Gallery Hero" 
        fill 
        className="object-cover group-hover:scale-105 transition-transform duration-1000" 
      />
    ) : (
      <div className="p-8 flex items-center justify-center h-full text-neutral-500">No images available</div>
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
  </div>
)
const PlaceInfoCards = ({ place }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-12">
    <div className="p-6 bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm flex flex-col items-center text-center gap-2 transition-all hover:shadow-md">
      <Star className="text-primary-500" size={24} />
      <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Rating</span>
      <span className="text-xl font-bold text-neutral-900 dark:text-white">{place?.rating || 0} / 5.0</span>
    </div>
    <div className="p-6 bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm flex flex-col items-center text-center gap-2 transition-all hover:shadow-md">
      <Edit className="text-primary-500" size={24} />
      <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Reviews</span>
      <span className="text-xl font-bold text-neutral-900 dark:text-white">{place?.reviewCount || 0} total</span>
    </div>
    <div className="p-6 bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm flex flex-col items-center text-center gap-2 transition-all hover:shadow-md">
      <MapPin className="text-primary-500" size={24} />
      <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Category</span>
      <span className="text-xl font-bold text-neutral-900 dark:text-white capitalize">{place?.category || 'General'}</span>
    </div>
  </div>
)
const PlaceMap = ({ location }) => (
  <div className="h-80 bg-neutral-100 dark:bg-dark-800 rounded-3xl mt-8 flex flex-col items-center justify-center text-center p-8 border border-neutral-200 dark:border-dark-700 shadow-inner group transition-all hover:bg-neutral-50 dark:hover:bg-dark-700/50">
    <MapPin className="text-neutral-400 dark:text-neutral-600 mb-4 group-hover:scale-110 transition-transform" size={40} />
    <h3 className="font-serif font-bold text-xl mb-2 text-neutral-900 dark:text-white">Location Detail</h3>
    <p className="text-neutral-600 dark:text-neutral-400 max-w-sm">{location?.address || 'Precise location details coming soon.'}</p>
  </div>
)
const PlaceReviews = () => <div className="mt-8"><h3 className="font-bold mb-4 text-neutral-900 dark:text-white">Reviews</h3><p className="text-neutral-600 dark:text-neutral-400">No reviews yet.</p></div>

export default function PlaceDetail({ params }) {
  const { placeId } = use(params)
  const { data: place, loading, error } = usePlace(placeId)

  if (loading) return <div className="min-h-screen flex justify-center items-center text-neutral-600 dark:text-neutral-400 bg-white dark:bg-dark-900">Loading place details...</div>
  if (error || !place) return <div className="min-h-screen flex justify-center items-center text-red-500 dark:text-red-400 bg-white dark:bg-dark-900">Failed to load place details.</div>

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900">
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
            <h1 className="text-4xl font-serif font-bold mb-2 text-neutral-900 dark:text-white">{place?.name}</h1>
            <div className="flex items-center gap-4 mt-3">
              <span className="badge px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm capitalize">{place?.category}</span>
              {place?.updatedAt && <span className="text-neutral-500 dark:text-neutral-400 text-sm">Last updated: {new Date(place.updatedAt).toLocaleDateString()}</span>}
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
            <h2 className="text-2xl font-serif font-bold mb-4 text-neutral-900 dark:text-white">About This Place</h2>
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

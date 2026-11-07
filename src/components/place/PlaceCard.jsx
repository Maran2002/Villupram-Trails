'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, MapPin, Bookmark, Sparkles, TrendingUp } from 'lucide-react'
import { PlaceImage } from '@/components/common/PlaceImage'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

export function PlaceCard({ place, index = 0 }) {
  const user = useAuthStore((state) => state.user)
  const userId = user?._id?.toString()
  const [savedPlace, setSavedPlace] = useState(null)
  const [saving, setSaving] = useState(false)
  const saved = savedPlace?.userId === userId && savedPlace?.saved === true

  useEffect(() => {
    if (!userId || !place?._id) return
    fetch(`/api/user/favorites?placeId=${encodeURIComponent(place._id)}`)
      .then((response) => response.ok ? response.json() : null)
      .then((result) => { if (result?.success) setSavedPlace({ userId, saved: result.data.saved }) })
      .catch(() => {})
  }, [userId, place?._id])

  const toggleSaved = async (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (!user) {
      toast.error('Sign in to save places')
      return
    }
    if (saving) return
    setSaving(true)
    try {
      const response = await fetch(saved ? `/api/user/favorites?placeId=${encodeURIComponent(place._id)}` : '/api/user/favorites', {
        method: saved ? 'DELETE' : 'PUT',
        headers: saved ? undefined : { 'Content-Type': 'application/json' },
        body: saved ? undefined : JSON.stringify({ placeId: place._id }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not update saved places')
      setSavedPlace({ userId, saved: result.data.saved })
      toast.success(result.data.saved ? 'Place saved' : 'Place removed from saved places')
    } catch (error) {
      toast.error(error.message || 'Could not update saved places')
    } finally {
      setSaving(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, y: 0,
      transition: { duration: 0.5, delay: index * 0.1, ease: 'easeOut' },
    },
  }

  if (!place) return null

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="h-full">
        <article className="h-full bg-white dark:bg-dark-800 rounded-2xl overflow-hidden border border-neutral-100 dark:border-dark-700 shadow-[0_4px_20px_-4px_rgba(172,68,37,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(172,68,37,0.12)] transition-all duration-500 hover:-translate-y-1 flex flex-col relative group">

          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <div className="absolute inset-0 bg-neutral-200 dark:bg-dark-700 animate-pulse" />
            <Link href={`/explore/${place._id}`} className="absolute inset-0 z-10" aria-label={`View ${place.name}`}>
              <PlaceImage
                src={place.images?.[0]}
                alt={place.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </Link>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 z-20 pointer-events-none" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-30">
              <div className="flex flex-col gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-primary-600 text-xs font-bold tracking-wider uppercase shadow-sm">
                  {place.category}
                </span>
                {(place.isFeatured || place.featured) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-500/95 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    <Sparkles size={10} />
                    Featured
                  </span>
                )}
                {(place.isTrending || place.trending) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-500/95 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
                    <TrendingUp size={10} />
                    Trending
                  </span>
                )}
              </div>

              <button
                className="p-2.5 bg-white/95 backdrop-blur-md dark:bg-dark-800/95 rounded-full text-neutral-400 hover:text-primary-500 hover:bg-white transition-colors shadow-sm"
                onClick={toggleSaved}
                disabled={saving}
                aria-label={saved ? 'Remove saved place' : 'Save place'}
                aria-pressed={saved}
              >
                <Bookmark size={16} strokeWidth={2.5} className={saved ? 'fill-current text-primary-500' : ''} />
              </button>
            </div>
          </div>

          {/* Content */}
          <Link href={`/explore/${place._id}`} className="flex flex-col flex-grow p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500">
            <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-2">
              {place.name}
            </h3>

            <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400 text-sm mb-4 font-medium">
              <MapPin size={14} className="shrink-0" />
              <span className="truncate">{place.location?.address}</span>
            </div>

            <p className="text-neutral-600 dark:text-neutral-300 text-sm mb-6 line-clamp-2 leading-relaxed flex-grow">
              {place.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-dark-700 mt-auto">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-accent-500 dark:text-accent-400">
                  <Star size={16} className="fill-current" />
                </div>
                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-50">
                  {(place.rating || 0).toFixed(1)}
                </span>
                <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
                  ({place.reviewCount || 0} reviews)
                </span>
              </div>

              <span className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore <span className="opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
              </span>
            </div>
          </Link>
        </article>
    </motion.div>
  )
}

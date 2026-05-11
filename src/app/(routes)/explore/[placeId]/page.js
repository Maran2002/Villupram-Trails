'use client'

import { use, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  MapPin, Star, Clock, Ticket, Share2, Bookmark, Calendar,
  Lightbulb, Accessibility, ExternalLink, ChevronRight, Check
} from 'lucide-react'
import { usePlace } from '@/lib/hooks/usePlaces'
import { PlaceReviews } from '@/components/place/PlaceReviews'
import { PlaceCarousel } from '@/components/place/PlaceCarousel'
import { getEmbedMapUrl, getExternalMapUrl } from '@/lib/maps'
import toast from 'react-hot-toast'

const TABS = ['Overview', 'Reviews', 'Nearby Routes', 'Directions']

/* ─── Split Gallery ─────────────────────────────────────── */


/* ─── Plan Your Visit sidebar ───────────────────────────── */
function PlanYourVisit({ place }) {
  const hasCoords = place?.location?.lat && place?.location?.lng
  const mapUrl = getExternalMapUrl(place?.name, place?.location)

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-5 shadow-sm sticky top-24">
      <h3 className="font-serif font-bold text-lg text-neutral-900 dark:text-white mb-4">Plan Your Visit</h3>
      <div className="space-y-4 text-sm">
        <div className="flex gap-3">
          <Calendar size={16} className="text-primary-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">Best Time to Visit</p>
            <p className="text-neutral-500 dark:text-neutral-400">{place?.bestTime || 'November to February'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Lightbulb size={16} className="text-primary-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">Practical Tips</p>
            <p className="text-neutral-500 dark:text-neutral-400">{place?.tips || 'Wear sturdy shoes. Carry water.'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Accessibility size={16} className="text-primary-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">Accessibility</p>
            <p className="text-neutral-500 dark:text-neutral-400">{place?.accessibility || 'Limited wheelchair access'}</p>
          </div>
        </div>
      </div>

      <button onClick={() => toast.success('Saved to your itinerary!')} className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-700 dark:hover:bg-white text-white dark:text-neutral-900 text-sm font-semibold rounded-xl transition-colors">
        <Bookmark size={15} /> Save to Itinerary
      </button>

      {/* Map view */}
      <div className="mt-4 group h-36 bg-neutral-100 dark:bg-dark-700 rounded-xl relative overflow-hidden border border-neutral-200 dark:border-dark-600">
        {hasCoords ? (
          <iframe
            title="Map"
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }}
            src={getEmbedMapUrl(place?.location)}
            allowFullScreen
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-4 text-center">
            <MapPin size={24} className="text-primary-500 mb-1" />
            <p className="text-[10px] text-neutral-500 leading-tight">{place?.location?.address || 'Villupuram District'}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        <a 
          href={mapUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 rounded-lg px-2 py-1 text-primary-600 dark:text-primary-400 font-bold shadow-sm hover:scale-105 transition-transform"
        >
          <ExternalLink size={10} /> VIEW LARGE MAP
        </a>
      </div>
      <p className="text-[10px] text-neutral-400 text-center mt-2 font-medium">Located in {place?.location?.address?.split(',').slice(-2).join(',') || 'Villupuram, Tamil Nadu'}</p>
    </div>
  )
}

/* ─── Opening Hours + Entry Fees cards ──────────────────── */
function InfoCards({ place }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      <div className="border border-neutral-200 dark:border-dark-700 rounded-2xl p-5 bg-white dark:bg-dark-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Clock size={16} className="text-primary-500" />
          </div>
          <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Opening Hours</h4>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{place?.openingHours || 'Open Daily'}</p>
        <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mt-1">{place?.timing || '9:00 AM – 5:30 PM'}</p>
        <p className="text-xs text-neutral-400 mt-1">Last entry 30 min before close</p>
      </div>
      <div className="border border-neutral-200 dark:border-dark-700 rounded-2xl p-5 bg-white dark:bg-dark-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Ticket size={16} className="text-primary-500" />
          </div>
          <h4 className="font-semibold text-neutral-900 dark:text-white text-sm">Entry Fees</h4>
        </div>
        {place?.entryFee ? (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{place.entryFee}</p>
        ) : (
          <div className="space-y-1 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between"><span>Indian Citizens</span><span className="font-medium text-neutral-900 dark:text-white">₹ 25</span></div>
            <div className="flex justify-between"><span>Foreign Nationals</span><span className="font-medium text-neutral-900 dark:text-white">₹ 250</span></div>
            <div className="flex justify-between"><span>Still Camera</span><span className="font-medium text-neutral-900 dark:text-white">₹ 25</span></div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function PlaceDetail({ params }) {
  const { placeId } = use(params)
  const { data: place, loading, error } = usePlace(placeId)
  const [activeTab, setActiveTab] = useState('Overview')

  if (loading) return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900 pt-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-96 bg-neutral-200 dark:bg-dark-700 rounded-2xl animate-pulse mb-6" />
        <div className="h-8 w-64 bg-neutral-200 dark:bg-dark-700 rounded animate-pulse mb-3" />
        <div className="h-4 w-48 bg-neutral-200 dark:bg-dark-700 rounded animate-pulse" />
      </div>
    </div>
  )

  if (error || !place) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-dark-900 gap-4">
      <p className="text-2xl">😕</p>
      <p className="text-neutral-600 dark:text-neutral-400">Failed to load this place.</p>
      <Link href="/explore" className="text-primary-500 hover:underline text-sm">← Back to Explore</Link>
    </div>
  )

  const reviewCount = place.reviewCount || 0

  const handleShare = useCallback(() => {
    const shareData = {
      title: `${place.name} | Villupuram Discovery Hub`,
      text: `Check out ${place.name} in Villupuram!`,
      url: window.location.href,
    }

    if (navigator.share) {
      navigator.share(shareData).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }, [place])

  const handleSave = () => {
    toast.success('Added to your bookmarks!')
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

        {/* Breadcrumbs */}
        <motion.div
          className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mb-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        >
          <Link href="/" className="hover:text-primary-500 transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link href="/explore" className="hover:text-primary-500 transition-colors">Explore</Link>
          <ChevronRight size={12} />
          <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate">{place.name}</span>
        </motion.div>

        {/* Tags + Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
          className="mb-5"
        >
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-semibold rounded-full capitalize">
              {place.category || 'Heritage Site'}
            </span>
            {place.subCategory && (
              <span className="px-2.5 py-1 bg-neutral-100 dark:bg-dark-700 text-neutral-600 dark:text-neutral-400 text-xs rounded-full">
                {place.subCategory}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-white mb-2">{place.name}</h1>
          <div className="flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <MapPin size={14} className="text-primary-500" />
            <span>{place.location?.address || 'Villupuram District, Tamil Nadu'}</span>
          </div>
        </motion.div>

        {/* Gallery / Carousel */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.05 }}>
          <PlaceCarousel images={place.images || []} name={place.name} />
        </motion.div>

        {/* Tab Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="flex border-b border-neutral-200 dark:border-dark-700 mt-6 mb-8 overflow-x-auto hide-scrollbar"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {tab}{tab === 'Reviews' && reviewCount > 0 ? ` (${reviewCount})` : ''}
            </button>
          ))}
          {/* Share / Save */}
          <div className="ml-auto flex items-center gap-2 pl-4">
            <button onClick={handleShare} className="p-2 rounded-lg text-neutral-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="Share">
              <Share2 size={16} />
            </button>
            <button onClick={handleSave} className="p-2 rounded-lg text-neutral-500 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="Save">
              <Bookmark size={16} />
            </button>
          </div>
        </motion.div>

        {/* Two-column layout */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}
        >
          {/* ── Left main content ── */}
          <div className="lg:col-span-2 space-y-8">

            {activeTab === 'Overview' && (
              <>
                {/* Description */}
                <div>
                  <h2 className="font-serif font-bold text-xl text-neutral-900 dark:text-white mb-3">
                    {place.nickname || 'About This Place'}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm whitespace-pre-wrap">
                    {place.fullDescription || place.description || 'No description available.'}
                  </p>
                </div>

                {/* Info cards */}
                <InfoCards place={place} />
              </>
            )}

            {activeTab === 'Reviews' && (
              <div>
                <h2 className="font-serif font-bold text-xl text-neutral-900 dark:text-white mb-5">
                  Community Experiences
                </h2>
                <PlaceReviews placeId={place._id} reviewCount={reviewCount} />
              </div>
            )}

            {(activeTab === 'Nearby Routes' || activeTab === 'Directions') && (
              <div className="py-16 text-center">
                <p className="text-4xl mb-3">🗺️</p>
                <p className="text-neutral-500 dark:text-neutral-400 font-medium">{activeTab} coming soon.</p>
              </div>
            )}

            {/* Community Experiences preview (always on Overview) */}
            {activeTab === 'Overview' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif font-bold text-xl text-neutral-900 dark:text-white">Community Experiences</h2>
                  <button
                    onClick={() => setActiveTab('Reviews')}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium flex items-center gap-1"
                  >
                    Read all <ChevronRight size={12} />
                  </button>
                </div>
                <PlaceReviews placeId={place._id} reviewCount={reviewCount} />
              </div>
            )}
          </div>

          {/* ── Right sidebar ── */}
          <div className="lg:col-span-1">
            <PlanYourVisit place={place} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

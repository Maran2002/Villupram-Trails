'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, MapPin, Bookmark } from 'lucide-react'
import { Card } from '@/components/common/Card'

export function PlaceCard({ place, index = 0 }) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, delay: index * 0.1 },
    },
  }

  if (!place) return null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Link href={`/explore/${place._id}`}>
        <Card interactive>
          {/* Image Container */}
          <div className="relative h-48 overflow-hidden group">
            <Image
              src={place.images?.[0] || '/images/places/placeholder.jpg'}
              alt={place.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            
            {/* Badge */}
            <div className="absolute top-3 right-3">
              <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                {place.category}
              </span>
            </div>

            {/* Save Button */}
            <button
              className="absolute top-3 left-3 p-2 bg-white/90 dark:bg-dark-800/90 rounded-full hover:bg-white dark:hover:bg-dark-700 transition"
              onClick={(e) => e.preventDefault()}
            >
              <Bookmark size={18} className="text-primary-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title */}
            <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white mb-1">
              {place.name}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 text-sm mb-3">
              <MapPin size={14} />
              <span>{place.location?.address}</span>
            </div>

            {/* Description */}
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2">
              {place.description}
            </p>

            {/* Rating & Reviews */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-dark-700">
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < Math.floor(place.rating || 0) ? 'fill-primary-400 text-primary-400' : 'text-neutral-300'}
                    />
                  ))}
                </div>
                <span className="ml-1 font-semibold text-sm text-neutral-900 dark:text-neutral-50">{(place.rating || 0).toFixed(1)}</span>
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {place.reviewCount || 0} reviews
              </span>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

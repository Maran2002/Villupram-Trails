'use client'

import { usePlaces } from '@/lib/hooks/usePlaces'
import { PlaceCard } from '../place/PlaceCard'

export function TrendingLocations() {
  const { data, loading, error } = usePlaces(1, 3, 'nature')
  const places = data?.items || []

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold mb-4">Trending Locations</h2>
          <p className="text-neutral-600 dark:text-neutral-400">See where others are going.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">Failed to load trending locations.</div>
        ) : places.length === 0 ? (
          <div className="text-center text-neutral-500 py-10">No trending locations found right now.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place, i) => (
              <PlaceCard key={place._id} place={place} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

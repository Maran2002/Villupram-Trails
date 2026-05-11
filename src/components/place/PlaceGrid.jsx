'use client'

import { PlaceCard } from './PlaceCard'
import { usePlaces } from '@/lib/hooks/usePlaces'
import { useFilterStore } from '@/lib/store/filterStore'

export function PlaceGrid() {
  const { category, search } = useFilterStore()
  const { data, loading, error } = usePlaces(
    1,
    12,
    category === 'all' ? null : category,
    search || null
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 shadow-sm">
            <div className="h-48 bg-neutral-200 dark:bg-dark-700 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-neutral-200 dark:bg-dark-700 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-neutral-200 dark:bg-dark-700 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-neutral-200 dark:bg-dark-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Failed to load places. Please try again.</div>
  }

  const places = data?.items || []

  if (places.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🗺️</p>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium">No places found{search ? ` for "${search}"` : ' in this category'}.</p>
        <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Try a different search or category.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {places.map((place, i) => (
        <PlaceCard key={place._id} place={place} index={i} />
      ))}
    </div>
  )
}

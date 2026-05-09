'use client'

import { PlaceCard } from './PlaceCard'
import { usePlaces } from '@/lib/hooks/usePlaces'
import { useFilterStore } from '@/lib/store/filterStore'

export function PlaceGrid() {
  const { category } = useFilterStore()
  const { data, loading, error } = usePlaces(1, 12, category === 'all' ? null : category)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Failed to load places. Please try again.</div>
  }

  const places = data?.items || []

  if (places.length === 0) {
    return <div className="text-center py-20 text-neutral-500 dark:text-neutral-400">No places found in this category.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {places.map((place, i) => (
        <PlaceCard key={place._id} place={place} index={i} />
      ))}
    </div>
  )
}

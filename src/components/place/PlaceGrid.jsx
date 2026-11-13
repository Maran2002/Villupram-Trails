'use client'

import { useEffect, useState } from 'react'
import { PlaceCard } from './PlaceCard'
import { usePlaces } from '@/lib/hooks/usePlaces'
import { useFilterStore } from '@/lib/store/filterStore'
import { ErrorState } from '@/components/common/ErrorState'
import { MapPinOff } from 'lucide-react'
import toast from 'react-hot-toast'

export function PlaceGrid() {
  const { category, search, featured, trending } = useFilterStore()
  return <PagedPlaceGrid key={JSON.stringify([category, search, featured, trending])}
    category={category} search={search} featured={featured} trending={trending} />
}

function PagedPlaceGrid({ category, search, featured, trending }) {
  const [page, setPage] = useState(1)
  const { data, loading, error, refetch } = usePlaces(
    page,
    12,
    category === 'all' ? null : category,
    search || null,
    featured || null,
    trending || null
  )

  useEffect(() => {
    if (error) {
      toast.error('Failed to load places. Please try again.')
    }
  }, [error])

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
    return (
      <div className="py-8">
        <ErrorState
          variant="section"
          icon={MapPinOff}
          title="Unable to Load Destinations"
          message="We encountered an issue fetching the directory of places. Please check your connection and try again."
          onRetry={() => {
            if (refetch) refetch()
            else window.location.reload()
          }}
          retryText="Try Again"
        />
      </div>
    )
  }

  const places = data?.items || []

  if (places.length === 0 && page === 1) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">🗺️</p>
        <p className="text-neutral-500 dark:text-neutral-400 font-medium">No places found{search ? ` for "${search}"` : ' in this category'}.</p>
        <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">Try a different search or category.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {places.length === 0 && <p className="text-center text-sm text-neutral-500">No destinations on this page.</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {places.map((place, i) => (
          <PlaceCard key={place._id} place={place} index={i} />
        ))}
      </div>
      {(page > 1 || data?.pages > 1) && (
        <nav aria-label="Explore result pages" className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}
            className="rounded-lg border px-4 py-2 disabled:opacity-50">Previous</button>
          <span role="status">Page {page} of {data?.pages || 1}</span>
          <button type="button" disabled={page >= (data?.pages ?? 1)} onClick={() => setPage(page + 1)}
            className="rounded-lg border px-4 py-2 disabled:opacity-50">Next</button>
        </nav>
      )}
    </div>
  )
}

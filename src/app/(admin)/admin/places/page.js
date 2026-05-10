'use client'

import { MapPin, ExternalLink, Edit2, Trash2 } from 'lucide-react'
import { usePlaces } from '@/lib/hooks/usePlaces'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminPlacesPage() {
  const { data, loading, error } = usePlaces(1, 20)
  const places = data?.items || []

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Places</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Manage all destination listings on the platform.</p>
        </div>
        <Link
          href="/contribute"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <MapPin size={16} />
          Add Place
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-52 bg-neutral-200 dark:bg-dark-700 rounded-2xl animate-shimmer" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 p-6 rounded-2xl text-sm">
          Failed to load places. Please try again.
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-dark-700 bg-neutral-50 dark:bg-dark-900/50">
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Place</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Reviews</th>
                  <th className="px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-dark-700">
                {places.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 dark:text-neutral-500 text-sm">
                      No places found.
                    </td>
                  </tr>
                )}
                {places.map((place) => (
                  <tr key={place._id} className="hover:bg-neutral-50 dark:hover:bg-dark-800/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-200 dark:bg-dark-700 shrink-0 relative">
                          {place.images?.[0] && (
                            <Image src={place.images[0]} alt={place.name} fill className="object-cover" sizes="40px" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-neutral-900 dark:text-white">{place.name}</p>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate max-w-[160px]">{place.location?.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-full capitalize">
                        {place.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">
                      {(place.rating || 0).toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                      {place.reviewCount || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/explore/${place._id}`}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          title="View"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

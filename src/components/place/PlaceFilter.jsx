'use client'

import { Card } from '@/components/common/Card'
import { useFilterStore } from '@/lib/store/filterStore'

const CATEGORIES = ['all', 'Heritage', 'Nature', 'Temple', 'Food', 'Beach', 'Adventure']

export function PlaceFilter() {
  const { category, setCategory, featured, setFeatured, trending, setTrending } = useFilterStore()

  return (
    <Card className="sticky top-24">
      <h3 className="font-serif font-bold text-lg mb-4 text-neutral-900 dark:text-white">Filters</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-neutral-600 dark:text-neutral-400 mb-3">Category</h4>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300 group">
                <inpu
                  type="radio"
                  name="category"
                  value={cat}
                  checked={category === cat}
                  onChange={() => setCategory(cat)}
                  className="text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-800 border-neutral-300 dark:border-dark-600"
                />
                <span className={`text-sm capitalize group-hover:text-primary-500 transition-colors ${category === cat ? 'text-primary-600 dark:text-primary-400 font-semibold' : ''}`}>
                  {cat === 'all' ? 'All Places' : cat}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-200 dark:border-dark-700">
          <h4 className="font-medium text-sm text-neutral-600 dark:text-neutral-400 mb-3">Highlights</h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className={`text-sm transition-colors ${featured ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-neutral-700 dark:text-neutral-300 group-hover:text-primary-500'}`}>Featured</span>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${featured ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-dark-700'}`}>
                <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="sr-only" />
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${featured ? 'translate-x-4' : 'translate-x-1'}`} />
              </div>
            </label>
            <label className="flex items-center justify-between cursor-pointer group">
              <span className={`text-sm transition-colors ${trending ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-neutral-700 dark:text-neutral-300 group-hover:text-primary-500'}`}>Trending</span>
              <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${trending ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-dark-700'}`}>
                <input type="checkbox" checked={trending} onChange={(e) => setTrending(e.target.checked)} className="sr-only" />
                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${trending ? 'translate-x-4' : 'translate-x-1'}`} />
              </div>
            </label>
          </div>
        </div>
      </div>
    </Card>
  )
}

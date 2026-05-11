'use client'

import { Card } from '@/components/common/Card'
import { useFilterStore } from '@/lib/store/filterStore'

const CATEGORIES = ['all', 'Heritage', 'Nature', 'Temple', 'Food', 'Beach', 'Adventure']

export function PlaceFilter() {
  const { category, setCategory } = useFilterStore()

  return (
    <Card className="sticky top-24">
      <h3 className="font-serif font-bold text-lg mb-4 text-neutral-900 dark:text-white">Filters</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-neutral-600 dark:text-neutral-400 mb-3">Category</h4>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300 group">
                <input
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
      </div>
    </Card>
  )
}

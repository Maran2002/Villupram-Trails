'use client'

import { Card } from '@/components/common/Card'

export function PlaceFilter() {
  return (
    <Card className="sticky top-24">
      <h3 className="font-serif font-bold text-lg mb-4 text-neutral-900 dark:text-white">Filters</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-sm text-neutral-600 dark:text-neutral-400 mb-2">Category</h4>
          <div className="space-y-2">
            {['Heritage', 'Nature', 'Temple', 'Food'].map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
                <input type="checkbox" className="rounded border-neutral-300 dark:border-dark-600 text-primary-500 focus:ring-primary-500 bg-white dark:bg-dark-800" />
                <span className="text-sm">{cat}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

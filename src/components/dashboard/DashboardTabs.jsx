'use client'

import { useState } from 'react'

export function DashboardTabs() {
  const [activeTab, setActiveTab] = useState('contributions')
  const tabs = ['contributions', 'reviews', 'drafts']

  return (
    <div>
      <div className="flex border-b border-neutral-200 dark:border-dark-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-primary-500 text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="py-4 text-neutral-700 dark:text-neutral-400">
        {activeTab === 'contributions' && <p>Your submitted places will appear here.</p>}
        {activeTab === 'reviews' && <p>Your reviews of places will appear here.</p>}
        {activeTab === 'drafts' && <p>Your incomplete drafts will appear here.</p>}
      </div>
    </div>
  )
}

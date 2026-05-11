'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, MessageSquare, FileText } from 'lucide-react'

const EMPTY_STATES = {
  contributions: {
    icon: MapPin,
    title: 'No places added yet',
    desc: 'Share a hidden gem with the Villupuram community.',
    cta: 'Add a Place',
    href: '/contribute',
  },
  reviews: {
    icon: MessageSquare,
    title: 'No reviews written yet',
    desc: 'Visit a place and share your experience with others.',
    cta: 'Explore Places',
    href: '/explore',
  },
  drafts: {
    icon: FileText,
    title: 'No drafts saved',
    desc: 'Start adding a place and save it as a draft to finish later.',
    cta: 'Start a Draft',
    href: '/contribute',
  },
}

export function DashboardTabs({ userId }) {
  const [activeTab, setActiveTab] = useState('contributions')
  const tabs = ['contributions', 'reviews', 'drafts']

  const empty = EMPTY_STATES[activeTab]
  const Icon = empty.icon

  return (
    <div>
      <div className="flex border-b border-neutral-200 dark:border-dark-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="py-12 flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
          <Icon size={28} className="text-primary-500" />
        </div>
        <div>
          <p className="font-serif font-bold text-lg text-neutral-900 dark:text-white mb-1">{empty.title}</p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-xs">{empty.desc}</p>
        </div>
        <Link
          href={empty.href}
          className="mt-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          {empty.cta}
        </Link>
      </div>
    </div>
  )
}

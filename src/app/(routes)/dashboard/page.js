'use client'

import { motion } from 'framer-motion'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { DashboardTabs } from '@/components/dashboard/DashboardTabs'
import { useAuthStore } from '@/lib/store'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const stats = [
    { label: 'Places Added', value: user?.contributions?.placesAdded || 0, icon: '📍' },
    { label: 'Reviews Written', value: user?.contributions?.reviewsWritten || 0, icon: '📝' },
    { label: 'Photos Uploaded', value: user?.contributions?.photosUploaded || 0, icon: '📸' },
    { label: 'Average Rating', value: '4.6/5', icon: '⭐' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-dark-900 dark:to-dark-800">
      {/* Header */}
      <motion.section
        className="py-12 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto mt-8">
          <h1 className="text-4xl font-serif font-bold mb-2 text-neutral-900 dark:text-white">
            Welcome, {user?.username || 'Traveler'}! 👋
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your contributions and see your impact on the community
          </p>
        </div>
      </motion.section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
            >
              <StatsCard {...stat} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Tabs Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <DashboardTabs />
      </section>
    </div>
  )
}

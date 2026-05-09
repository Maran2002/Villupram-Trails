'use client'

import { motion } from 'framer-motion'
import { PlaceGrid } from '@/components/place/PlaceGrid'
import { PlaceFilter } from '@/components/place/PlaceFilter'

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-dark-900 dark:to-dark-800">
      {/* Header */}
      <motion.section
        className="py-12 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-serif font-bold mb-2">Explore Villupuram</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Discover amazing places
          </p>
        </div>
      </motion.section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <motion.aside
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <PlaceFilter />
          </motion.aside>

          {/* Grid */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PlaceGrid />
          </motion.div>
        </div>
      </section>
    </div>
  )
}

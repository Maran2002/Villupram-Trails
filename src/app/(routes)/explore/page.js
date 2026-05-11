'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Compass, SlidersHorizontal, Map as MapIcon, X } from 'lucide-react'
import { PlaceGrid } from '@/components/place/PlaceGrid'
import { PlaceFilter } from '@/components/place/PlaceFilter'
import { useFilterStore } from '@/lib/store/filterStore'

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
}

export default function ExplorePage() {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { search, setSearch } = useFilterStore()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900 pb-24">
      {/* Premium Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-neutral-200/60 dark:border-dark-800/60">
        <div className="absolute inset-0 bg-white dark:bg-dark-900 z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 dark:bg-primary-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary-100 dark:bg-secondary-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-accent-100 dark:bg-accent-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div 
            className="flex flex-col items-center text-center max-w-3xl mx-auto"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6 border border-primary-100 dark:border-primary-800/50 shadow-sm">
              <Compass size={16} />
              <span className="tracking-wide">Discover The Unseen</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-serif font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
              Explore <span className="text-primary-500 italic font-light">Villupuram</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-10 leading-relaxed max-w-2xl">
              From ancient temples to breathtaking landscapes, uncover the hidden gems and rich heritage of our vibrant district.
            </motion.p>

            {/* Interactive Search Bar */}
            <motion.div variants={fadeUp} className="w-full max-w-2xl relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={22} className="text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search places, categories, or keywords..."
                className="w-full h-16 pl-14 pr-32 rounded-2xl bg-white dark:bg-dark-800 border-2 border-transparent shadow-xl shadow-neutral-200/50 dark:shadow-dark-900/50 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-lg"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-primary-500 hover:bg-primary-600 text-white px-6 rounded-xl font-medium transition-colors shadow-md">
                Search
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <MapPin className="text-primary-500" />
            Featured Destinations
          </h2>
          
          <div className="flex gap-3">
            <button 
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-lg text-sm font-medium shadow-sm hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-lg text-sm font-medium shadow-sm hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors text-primary-600 dark:text-primary-400">
              <MapIcon size={16} />
              Map View
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Sidebar Filters */}
          <motion.aside
            className="hidden lg:block lg:col-span-1 sticky top-32"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <PlaceFilter />
          </motion.aside>

          {/* Grid Container */}
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

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white dark:bg-dark-900 shadow-2xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-4 flex items-center justify-between border-b border-neutral-200 dark:border-dark-800 sticky top-0 bg-white dark:bg-dark-900 z-10">
                <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-primary-500" />
                  Filters
                </h3>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 bg-neutral-100 dark:bg-dark-800 rounded-full hover:bg-neutral-200 dark:hover:bg-dark-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <PlaceFilter />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

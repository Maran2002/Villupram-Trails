'use client'

import { motion } from 'framer-motion'
import { HeroSection } from '@/components/hero/HeroSection'
import { FeaturedPlaces } from '@/components/sections/FeaturedPlaces'
import { TrendingLocations } from '@/components/sections/TrendingLocations'
import { CommunityStats } from '@/components/sections/CommunityStats'
import { CallToAction } from '@/components/sections/CallToAction'

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <HeroSection />
      <FeaturedPlaces />
      <TrendingLocations />
      <CommunityStats />
      <CallToAction />
    </motion.div>
  )
}

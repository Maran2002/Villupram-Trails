'use client'

import { HeroSection } from '@/components/hero/HeroSection'
import { FeaturedPlaces } from '@/components/sections/FeaturedPlaces'
import { CommunityStats } from '@/components/sections/CommunityStats'
import { TrendingLocations } from '@/components/sections/TrendingLocations'
import { CallToAction } from '@/components/sections/CallToAction'

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturedPlaces />
      <CommunityStats />
      <TrendingLocations />
      <CallToAction />
    </div>
  )
}

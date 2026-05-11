'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import HeroImg from '@/app/assets/hero/bg-hero.jpg'

export function HeroSection() {
  return (
    <div className="relative h-screen overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-800">
      {/* Background Image */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
      >
        <Image
          src={HeroImg.src}
          alt="Villupuram"
          fill
          className="object-cover"
          priority
        />
        {/* Soft top gradient — darkens area behind navbar */}
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-black/70 via-black/20 to-transparent z-10 pointer-events-none" />
        {/* Bottom gradient — existing */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/55" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
          Villupuram District, Tamil Nadu
        </motion.div>

        <motion.h1
          className="text-hero-xl font-serif font-bold text-white mb-6 max-w-4xl leading-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Discover Hidden Gems Across <span className="text-primary-400 italic">Villupuram</span>
        </motion.h1>

        <motion.p
          className="text-xl text-neutral-200 mb-10 max-w-xl leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Curated by travelers, verified by the community
        </motion.p>

        <motion.div
          className="flex gap-4 flex-wrap justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link href="/explore">
            <Button size="lg" className="shadow-xl shadow-primary-900/40 px-8">Explore Places</Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 px-8">
              Join Community
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
        <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </div>
  )
}

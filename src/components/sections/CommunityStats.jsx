'use client'

import { motion } from 'framer-motion'
import { MapPin, Users, Star, Eye } from 'lucide-react'

const stats = [
  { label: 'Places Catalogued', value: '120+', icon: MapPin, color: 'text-primary-400', bg: 'bg-primary-500/10' },
  { label: 'Community Members', value: '1.2K+', icon: Users, color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
  { label: 'Reviews Written', value: '500+', icon: Star, color: 'text-accent-400', bg: 'bg-accent-500/10' },
  { label: 'Monthly Visitors', value: '8K+', icon: Eye, color: 'text-primary-300', bg: 'bg-primary-400/10' },
]

export function CommunityStats() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark-900 relative overflow-hidden">
      {/* Subtle decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-semibold tracking-widest uppercase text-primary-500 mb-4">Our Impact</p>
          <h2 className="text-4xl font-serif font-bold text-neutral-900 dark:text-white mb-4">
            Trusted by the Community
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto">
            A growing platform dedicated to uncovering every corner of Villupuram district.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-neutral-50 dark:bg-dark-800 rounded-2xl p-8 border border-neutral-200 dark:border-dark-700 text-center group hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={26} />
              </div>
              <h3 className="text-4xl font-serif font-bold text-neutral-900 dark:text-white mb-2">{stat.value}</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

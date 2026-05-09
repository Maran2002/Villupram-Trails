'use client'

import { motion } from 'framer-motion'
import { Users, ShieldCheck, Camera, Compass } from 'lucide-react'
import { Button } from '@/components/common/Button'

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[716px] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            alt="Hero Background" 
            className="w-full h-full object-cover object-center filter brightness-[0.85]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjJBx9tJWPQP7jdMK8_KF4pccMuIzDWDjM_SsNCpDW6vK2yIrJQ8o79LHaf-NNV-onJK_AkE6iw-ykGfYs__sQh_dKkX19vJWBCpzqv9mh1jZuZl_XYy5a6bYdKYqpwjZyhXeM1-RpBC0iW2Zck0ZyQfzirXHABI-HGhAfHYHWCuShb6kRw0tAEabjmt_-XvGUeuBJo-dv9jnKuqj7iXmsAL_8AJubu0DhChhNHKqxThtRBiy9q4iRPVGEm1ERfEoO5OOburqkEv4"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-50/90 dark:to-dark-900/90"></div>
        </div>
        <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl mx-auto mt-20">
          <motion.span 
            className="text-xs text-primary-500 uppercase tracking-widest block mb-4 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Story
          </motion.span>
          <motion.h1 
            className="font-serif text-4xl md:text-6xl text-white mb-8 drop-shadow-md leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Discovering Villupuram,<br/>One Place at a Time
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-neutral-200 max-w-2xl mx-auto drop-shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We are dedicated to unearthing the hidden gems, celebrating the rich heritage, and curating unparalleled experiences in the heart of Tamil Nadu.
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 md:px-8 bg-white dark:bg-dark-900">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl text-primary-600 dark:text-primary-400 mb-8">Our Mission</h2>
          <div className="w-16 h-1 bg-secondary-500 mx-auto mb-8 rounded-full"></div>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            To elevate the narrative of Villupuram from a mere transit hub to a premier destination of cultural depth, natural beauty, and historical significance. We strive to provide the discerning traveler with an authentic, meticulously crafted journey through a landscape steeped in antiquity and vibrant life, fostering a profound connection between the visitor and the soul of the region.
          </p>
        </motion.div>
      </section>

      {/* Values Bento Grid */}
      <section className="py-20 px-4 md:px-8 bg-neutral-50 dark:bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-primary-600 dark:text-primary-400 mb-4">Core Values</h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">The principles that guide our curation and community building.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div 
              className="bg-white/70 dark:bg-dark-900/70 backdrop-blur-md border border-neutral-200 dark:border-dark-700 p-8 rounded-xl flex flex-col items-start hover:-translate-y-1 transition-transform duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400">
                <Users size={24} />
              </div>
              <h3 className="font-serif text-2xl text-neutral-900 dark:text-white mb-2">Community-Driven</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Built by and for those who hold a deep appreciation for local heritage and shared stories.</p>
            </motion.div>

            <motion.div 
              className="bg-white/70 dark:bg-dark-900/70 backdrop-blur-md border border-neutral-200 dark:border-dark-700 p-8 rounded-xl flex flex-col items-start hover:-translate-y-1 transition-transform duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-full bg-secondary-100 dark:bg-secondary-900/30 flex items-center justify-center mb-6 text-secondary-600 dark:text-secondary-400">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-serif text-2xl text-neutral-900 dark:text-white mb-2">Verified & Trusted</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Every experience and location is rigorously vetted to ensure an uncompromising standard of quality.</p>
            </motion.div>

            <motion.div 
              className="bg-white/70 dark:bg-dark-900/70 backdrop-blur-md border border-neutral-200 dark:border-dark-700 p-8 rounded-xl flex flex-col items-start hover:-translate-y-1 transition-transform duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="w-12 h-12 rounded-full bg-tertiary-100 dark:bg-tertiary-900/30 flex items-center justify-center mb-6 text-tertiary-600 dark:text-tertiary-400">
                <Camera size={24} />
              </div>
              <h3 className="font-serif text-2xl text-neutral-900 dark:text-white mb-2">Rich Media</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Showcasing the region through breathtaking, high-fidelity visual storytelling that captures its true essence.</p>
            </motion.div>

            <motion.div 
              className="bg-white/70 dark:bg-dark-900/70 backdrop-blur-md border border-neutral-200 dark:border-dark-700 p-8 rounded-xl flex flex-col items-start hover:-translate-y-1 transition-transform duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6 text-primary-600 dark:text-primary-400">
                <Compass size={24} />
              </div>
              <h3 className="font-serif text-2xl text-neutral-900 dark:text-white mb-2">Growth & Discovery</h3>
              <p className="text-neutral-600 dark:text-neutral-400">Continuously expanding our horizons to bring you the most compelling, undiscovered narratives.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-8 bg-white dark:bg-dark-900 border-t border-neutral-200 dark:border-dark-700">
        <motion.div 
          className="max-w-4xl mx-auto text-center bg-neutral-50 dark:bg-dark-800 p-12 rounded-xl relative overflow-hidden border border-neutral-200 dark:border-dark-700 shadow-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-tertiary-500"></div>
          <h2 className="font-serif text-3xl md:text-4xl text-neutral-900 dark:text-white mb-4">Shape the Narrative</h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Are you a passionate storyteller, photographer, or local expert? Help us curate the definitive guide to Villupuram's elegance.
          </p>
          <Button size="lg" className="shadow-lg shadow-primary-500/20">
            Join Us as a Contributor
          </Button>
        </motion.div>
      </section>
    </div>
  )
}

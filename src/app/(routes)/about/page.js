'use client'

import { motion } from 'framer-motion'
import { Users, ShieldCheck, Camera, Compass, Heart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/common/Button'
import Link from 'next/link'
import heroImg from '@/app/assets/about/bg-about.jpg'
import cardImg from '@/app/assets/about/card-about.jpg'
import { useAuthStore, useSettingsStore } from '@/lib/store'

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
}

export default function AboutPage() {
  const { user } = useAuthStore()
  const { settings } = useSettingsStore()
  
  const ctaLink = !user 
    ? '/auth/register?type=contributor' 
    : user.role === 'admin' 
      ? '/admin' 
      : '/dashboard'

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900 overflow-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <img alt="Background landscape" className="w-full h-full object-cover object-center filter brightness-[0.65]" src={heroImg.src} />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-900/60 via-dark-900/20 to-neutral-50 dark:to-dark-900"></div>
        </motion.div>
        
        <motion.div className="relative z-10 text-center px-4 md:px-8 max-w-5xl mx-auto mt-20" variants={staggerContainer} initial="hidden" animate="show">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-8 shadow-2xl">
            <Heart size={16} className="text-primary-400" />
            <span className="tracking-wide">Crafted for Travelers, by Locals</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 drop-shadow-2xl leading-[1.1] tracking-tight">
            Discover {settings.siteName || 'Villupuram'},<br/>
            <span className="text-primary-300 italic">One Place at a Time</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg md:text-2xl text-neutral-200 max-w-3xl mx-auto drop-shadow-md font-light leading-relaxed mb-10">
            {settings.seoDescription || 'We are dedicated to unearthing hidden gems, celebrating rich heritage, and curating unparalleled experiences in the heart of Tamil Nadu.'}
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/explore">
              <Button size="sm" className="shadow-lg shadow-primary-500/30 text-lg px-4 py-3 rounded-full hover:scale-105 transition-transform duration-300">Start Exploring</Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-4 md:px-8 relative">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
        <motion.div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer}>
          <motion.div variants={fadeUp} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-3xl blur-2xl -z-10"></div>
            <h2 className="font-serif text-4xl md:text-5xl text-neutral-900 dark:text-white mb-6 leading-tight">
              Elevating the Narrative of <span className="text-primary-600 dark:text-primary-400 italic">{settings.siteName || 'Villupuram Hub'}</span>
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 mb-8 rounded-full"></div>
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 font-light">
              From a mere transit hub to a premier destination of cultural depth, natural beauty, and historical significance. We strive to provide the discerning traveler with an authentic, meticulously crafted journey.
            </p>
            <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">
              Through a landscape steeped in antiquity and vibrant life, we foster a profound connection between the visitor and the soul of the region.
            </p>
          </motion.div>
          <motion.div variants={fadeUp} className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
            <img src={cardImg.src} alt="Local culture" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8"><p className="text-white text-xl font-medium font-serif italic">"Preserving the past, inspiring the future."</p></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 md:px-8 bg-white dark:bg-dark-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div className="text-center mb-20" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <span className="text-sm text-secondary-500 uppercase tracking-widest font-bold mb-3 block">What Drives Us</span>
            <h2 className="font-serif text-4xl md:text-5xl text-neutral-900 dark:text-white mb-6">Our Core Principles</h2>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-light">The foundational values that guide our curation, community building, and storytelling.</p>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}>
            {[
              { icon: Users, color: 'text-primary-500', bg: 'bg-primary-500/10', title: 'Community-Driven', desc: 'Built by and for those who hold a deep appreciation for local heritage and shared stories.' },
              { icon: ShieldCheck, color: 'text-secondary-500', bg: 'bg-secondary-500/10', title: 'Verified & Trusted', desc: 'Every experience and location is rigorously vetted to ensure an uncompromising standard of quality.' },
              { icon: Camera, color: 'text-primary-500', bg: 'bg-primary-500/10', title: 'Rich Media', desc: 'Showcasing the region through breathtaking, high-fidelity visual storytelling that captures its true essence.' },
              { icon: Compass, color: 'text-secondary-500', bg: 'bg-secondary-500/10', title: 'Growth & Discovery', desc: 'Continuously expanding our horizons to bring you the most compelling, undiscovered narratives.' }
            ].map((value, idx) => (
              <motion.div key={idx} variants={fadeUp} className="group bg-white dark:bg-dark-900 border border-neutral-100 dark:border-dark-800 p-8 rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-primary-500/5 transition-all duration-500 relative overflow-hidden">
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl ${value.bg} flex items-center justify-center mb-8 ${value.color} group-hover:scale-110 transition-transform duration-500`}><value.icon size={32} strokeWidth={1.5} /></div>
                  <h3 className="font-serif text-2xl text-neutral-900 dark:text-white mb-4 transition-colors">{value.title}</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed font-light">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-8 relative">
        <motion.div className="max-w-5xl mx-auto text-center bg-dark-900 p-12 md:p-20 rounded-[3rem] relative overflow-hidden shadow-2xl" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div className="relative z-10">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight">Ready to Shape the <span className="italic text-primary-300">Narrative?</span></h2>
            <p className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto font-light leading-relaxed">Join our elite community and help curate the definitive guide to {settings.siteName || 'Villupuram'}'s elegance.</p>
            <Link href={ctaLink}>
              <Button size="md" className="text-dark-900 cursor-pointer hover:bg-neutral-100 text-lg px-4 py-3 rounded-full group flex items-center gap-3 mx-auto">
                {user ? (user.role === 'admin' ? 'Admin Dashboard' : 'Contribute Now') : 'Become a Contributor'}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

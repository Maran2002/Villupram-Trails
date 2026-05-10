'use client'

import { motion } from 'framer-motion'
import { Shield, PenTool, Users, Image as ImageIcon, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react'

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900 pb-20">
      {/* Hero Section */}
      <section className="bg-white dark:bg-dark-800 border-b border-neutral-200 dark:border-dark-700 pt-24 pb-16 px-4 md:px-8 text-center">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BookOpen size={32} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 dark:text-white mb-6">Platform Guidelines</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Our guidelines are designed to keep the Villupuram Discovery Hub authentic, respectful, and highly informative. By participating in our community, you agree to uphold these standards.
          </p>
        </motion.div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Contributor Guidelines */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <PenTool className="text-secondary-500" size={28} />
            <h2 className="font-serif text-3xl text-neutral-900 dark:text-white">Contributor Guidelines</h2>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 border border-neutral-200 dark:border-dark-700 shadow-sm flex flex-col gap-8">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-medium text-neutral-900 dark:text-white mb-3">
                <CheckCircle className="text-green-500" size={20} /> Accuracy & Originality
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                When adding a new place, ensure all information (location, historical context, opening hours) is strictly accurate. Do not plagiarize content from other websites or travel guides. Your descriptions should be written in your own words based on factual knowledge or personal visits.
              </p>
            </div>

            <div className="h-px bg-neutral-100 dark:bg-dark-700 w-full"></div>

            <div>
              <h3 className="flex items-center gap-2 text-xl font-medium text-neutral-900 dark:text-white mb-3">
                <ImageIcon className="text-primary-500" size={20} /> High-Quality Media
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Photos are the heart of the Discovery Hub. Upload clear, high-resolution images in landscape orientation. 
                <br /><br />
                <strong>Avoid:</strong> Heavy filters, watermarks, prominent selfies, or blurry/dark photos. Ensure you have the right to upload the images (do not use copyrighted stock photos).
              </p>
            </div>

            <div className="h-px bg-neutral-100 dark:bg-dark-700 w-full"></div>

            <div>
              <h3 className="flex items-center gap-2 text-xl font-medium text-neutral-900 dark:text-white mb-3">
                <Shield className="text-accent-500" size={20} /> Objective Descriptions
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                The main description of a place should be objective and informative. Save your personal opinions, ratings, and subjective experiences for the <strong>Reviews</strong> section. The directory listing should serve as an unbiased guide.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Community Guidelines */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Users className="text-primary-500" size={28} />
            <h2 className="font-serif text-3xl text-neutral-900 dark:text-white">Community Guidelines</h2>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 border border-neutral-200 dark:border-dark-700 shadow-sm flex flex-col gap-8">
            <div>
              <h3 className="flex items-center gap-2 text-xl font-medium text-neutral-900 dark:text-white mb-3">
                <AlertTriangle className="text-yellow-500" size={20} /> Respectful Interactions
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                We have a zero-tolerance policy for hate speech, harassment, discriminatory language, or bullying. Reviews and comments should focus on the location and the experience, not on attacking other users, staff members, or locals.
              </p>
            </div>

            <div className="h-px bg-neutral-100 dark:bg-dark-700 w-full"></div>

            <div>
              <h3 className="flex items-center gap-2 text-xl font-medium text-neutral-900 dark:text-white mb-3">
                <CheckCircle className="text-green-500" size={20} /> Constructive Reviews
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Whether positive or negative, reviews must be constructive. Explain <em>why</em> you rated a place a certain way. Avoid one-word reviews or spamming the same review across multiple locations. Only review places you have genuinely visited.
              </p>
            </div>

            <div className="h-px bg-neutral-100 dark:bg-dark-700 w-full"></div>

            <div>
              <h3 className="flex items-center gap-2 text-xl font-medium text-neutral-900 dark:text-white mb-3">
                <Shield className="text-red-500" size={20} /> No Promotional Spam
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Do not use the platform to aggressively promote your own business, drop referral links, or spam promotional material in the reviews or place descriptions. Business owners claiming a page must adhere to our professional conduct rules.
              </p>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  )
}

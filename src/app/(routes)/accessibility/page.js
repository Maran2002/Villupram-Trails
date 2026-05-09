'use client'

import { motion } from 'framer-motion'
import { Accessibility } from 'lucide-react'

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900 pb-20">
      <section className="bg-white dark:bg-dark-800 border-b border-neutral-200 dark:border-dark-700 pt-32 pb-16 px-4 md:px-8 text-center">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Accessibility size={32} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 dark:text-white mb-6">Accessibility Statement</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Committed to an inclusive web experience.
          </p>
        </motion.div>
      </section>

      <section className="max-w-4xl mx-auto px-4 md:px-8 mt-16">
        <motion.div 
          className="bg-white dark:bg-dark-800 rounded-3xl p-8 md:p-12 border border-neutral-200 dark:border-dark-700 shadow-sm prose prose-neutral dark:prose-invert max-w-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2>Our Commitment</h2>
          <p>Villupuram Discovery Hub is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to guarantee we provide equal access to all of our users.</p>

          <h2>Measures to Support Accessibility</h2>
          <p>Villupuram Discovery Hub takes the following measures to ensure accessibility of the platform:</p>
          <ul>
            <li>Include accessibility as part of our mission statement.</li>
            <li>Include accessibility throughout our internal policies.</li>
            <li>Provide continual accessibility training for our staff and developers.</li>
            <li>Assign clear accessibility targets and responsibilities.</li>
            <li>Employ formal accessibility quality assurance methods.</li>
          </ul>

          <h2>Conformance Status</h2>
          <p>The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. Villupuram Discovery Hub is partially conformant with WCAG 2.1 level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard.</p>

          <h2>Technical Specifications</h2>
          <p>Accessibility of Villupuram Discovery Hub relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins installed on your computer:</p>
          <ul>
            <li>HTML</li>
            <li>WAI-ARIA</li>
            <li>CSS</li>
            <li>JavaScript</li>
          </ul>
          <p>These technologies are relied upon for conformance with the accessibility standards used.</p>

          <h2>Feedback</h2>
          <p>We welcome your feedback on the accessibility of Villupuram Discovery Hub. Please let us know if you encounter accessibility barriers on the platform by reaching out to us through our FAQ Support form.</p>
          <p>We try to respond to feedback within 2 business days.</p>
        </motion.div>
      </section>
    </div>
  )
}

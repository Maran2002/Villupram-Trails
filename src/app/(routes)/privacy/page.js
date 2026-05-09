'use client'

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900 pb-20">
      <section className="bg-white dark:bg-dark-800 border-b border-neutral-200 dark:border-dark-700 pt-32 pb-16 px-4 md:px-8 text-center">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 dark:text-white mb-6">Privacy Policy</h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Last updated: May 10, 2026
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
          <h2>1. Introduction</h2>
          <p>Welcome to Villupuram Discovery Hub. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>

          <h2>2. The Data We Collect About You</h2>
          <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
          <ul>
            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location.</li>
            <li><strong>Profile Data:</strong> includes your username and password, contributions made by you, your interests, preferences, and feedback.</li>
          </ul>

          <h2>3. How We Use Your Personal Data</h2>
          <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
          <ul>
            <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., creating an account).</li>
            <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
            <li>Where we need to comply with a legal or regulatory obligation.</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know.</p>

          <h2>5. Data Retention</h2>
          <p>We will only retain your personal data for as long as necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>

          <h2>6. Your Legal Rights</h2>
          <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data. These include the right to:</p>
          <ul>
            <li>Request access to your personal data.</li>
            <li>Request correction of your personal data.</li>
            <li>Request erasure of your personal data.</li>
            <li>Object to processing of your personal data.</li>
          </ul>

          <h2>7. Contact Us</h2>
          <p>If you have any questions about this privacy policy or our privacy practices, please contact us using the support form provided on our FAQ page.</p>
        </motion.div>
      </section>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { Shield, Info } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900 pb-20">
      <section className="bg-white dark:bg-dark-800 border-b border-neutral-200 dark:border-dark-700 pt-32 pb-16 px-4 md:px-8 text-center">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield size={32} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 dark:text-white mb-6">Terms of Service</h1>
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
          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl mb-8 border border-blue-100 dark:border-blue-900/50">
            <Info className="shrink-0" size={24} />
            <p className="m-0 font-medium text-sm">Please read these terms carefully before using the Villupuram Discovery Hub platform.</p>
          </div>

          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using the Villupuram Discovery Hub ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Platform.</p>

          <h2>2. User Accounts</h2>
          <p>When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Platform.</p>
          <ul>
            <li>You are responsible for safeguarding the password that you use to access the service.</li>
            <li>You agree not to disclose your password to any third party.</li>
            <li>You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</li>
          </ul>

          <h2>3. Content Contributions</h2>
          <p>Our Platform allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post to the Service, including its legality, reliability, and appropriateness.</p>
          <p>By posting Content to the Platform, you grant us the right and license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.</p>

          <h2>4. Prohibited Uses</h2>
          <p>You may use the Platform only for lawful purposes and in accordance with these Terms. You agree not to use the Platform:</p>
          <ul>
            <li>In any way that violates any applicable national or international law or regulation.</li>
            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail", "chain letter," "spam," or any other similar solicitation.</li>
            <li>To impersonate or attempt to impersonate the Platform, a company employee, another user, or any other person or entity.</li>
          </ul>

          <h2>5. Intellectual Property</h2>
          <p>The Platform and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of Villupuram Discovery Hub and its licensors. The Platform is protected by copyright, trademark, and other laws.</p>

          <h2>6. Termination</h2>
          <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

          <h2>7. Changes to Terms</h2>
          <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.</p>
        </motion.div>
      </section>
    </div>
  )
}

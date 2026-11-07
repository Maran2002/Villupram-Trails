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
            Last updated: November 7, 2026
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
          <p>This notice describes data handled by the current application. The operator should review its legal identity and applicable privacy obligations before production. Privacy requests can currently be submitted through the Contact form.</p>

          <h2>2. The Data We Collect About You</h2>
          <p>Depending on how you use the site, the application stores:</p>
          <ul>
            <li><strong>Account data:</strong> username, email address, password hash, role, verification, and permission settings.</li>
            <li><strong>Community and contact data:</strong> places, reviews, moderation state, reports, support messages, and email addresses submitted through the updates form.</li>
            <li><strong>Page-view data:</strong> new records contain public-page paths without query strings, referrer origin, and coarse device/browser/operating-system labels. Admin, authentication, contribution, and dashboard paths are excluded. New records omit raw user-agent strings, screen dimensions, and IP addresses. Older visitor records may retain user-agent strings, screen dimensions, and an `ip` field that came from browser-submitted data; those records need review and cleanup. Hosting infrastructure may maintain separate logs.</li>
            <li><strong>Session data:</strong> an authentication cookie used to keep you signed in. It is HttpOnly and SameSite=Lax, and Secure in production.</li>
          </ul>

          <h2>3. How We Use Your Personal Data</h2>
          <p>The application uses account data to authenticate users, apply permissions, and associate contributions with their authors. It uses community content for moderation and support workflows, submitted updates-list emails for administrator reference, and page-view records for aggregate traffic counts. Automated newsletter emails are not sent.</p>
          <ul>
            <li>Records are stored in the configured MongoDB database and may be processed by the hosting and database providers selected by the operator.</li>
            <li>Visitor page-view records are scheduled for automatic deletion after 90 days. Closed support tickets and reports are scheduled for deletion 365 days after their last status update to closed. Audit logs are scheduled for deletion after 365 days.</li>
            <li>Newsletter addresses do not expire automatically; they remain stored until an operator removes them. Account, place, review, and other records do not have a general automatic retention schedule.</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>The application hashes passwords and uses an HttpOnly session cookie. Access to administrative data is permission checked by server routes. Deployment, database, backup, and provider controls depend on operator configuration and must be reviewed before production.</p>

          <h2>5. Data Retention</h2>
          <p>MongoDB performs scheduled expiry asynchronously, so deletion may occur after the stated period rather than at an exact time. Existing visitor records may retain older fields until they expire. Account and contribution deletion requests require manual review.</p>

          <h2>6. Requests and Support</h2>
          <p>For privacy questions or requests about account and contribution data, use the <a href="/contact">contact form</a>. It records a support ticket for administrator review; it does not automatically delete records or send an email reply.</p>

          <h2>7. Contact Us</h2>
          <p>The contact form is the current privacy request channel. Please do not include passwords or sensitive identity documents in a message.</p>
        </motion.div>
      </section>
    </div>
  )
}

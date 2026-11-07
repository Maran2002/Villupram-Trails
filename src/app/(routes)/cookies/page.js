'use client'

import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'

export default function CookiePage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900 pb-20">
      <section className="bg-white dark:bg-dark-800 border-b border-neutral-200 dark:border-dark-700 pt-32 pb-16 px-4 md:px-8 text-center">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Eye size={32} />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 dark:text-white mb-6">Cookie Policy</h1>
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
          <h2>1. What are Cookies?</h2>
          <p>Cookies are small text files stored by a website in your browser. Villupuram Trails uses an HttpOnly session cookie after you sign in. The site also uses browser storage for theme preferences. Visitor analytics are sent to the site API and stored in the database; they are not analytics cookies.</p>

          <h2>2. How We Use Cookies</h2>
          <p>The session cookie is used to:</p>
          <ul>
            <li>Make our website work as you&apos;d expect.</li>
            <li>Keep your authenticated session available to protected pages and API requests.</li>
          </ul>
          <p>The session cookie is marked HttpOnly and SameSite=Lax; it is marked Secure in production. Sign out to clear it. Browser storage and server-side visitor logging are described separately from cookies.</p>

          <h2>3. Types of Cookies We Use</h2>
          
          <h3>Essential Cookies</h3>
          <p>These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.</p>
          
          <h3>Browser Preferences</h3>
          <p>The theme preference is stored in browser storage by the theme provider; it is not a cookie.</p>
          
          <h3>Visitor Analytics</h3>
          <p>When visitor analytics are active, the site records the path without query parameters, the referrer origin, coarse device/browser/operating-system labels, and the visit time. It does not store the full browser user agent or screen dimensions in new visitor records. This tracking is not implemented with analytics cookies.</p>

          <h2>4. Managing Cookies</h2>
          <p>You can usually switch cookies off by adjusting your browser settings to stop it from accepting cookies. Doing so, however, may limit the functionality of our website and many other sites, as cookies are a standard part of most modern websites.</p>

          <h2>5. Updates to this Policy</h2>
          <p>We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.</p>
        </motion.div>
      </section>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search, HelpCircle, CheckCircle, Edit, Star, User, 
  ChevronDown, Book, PlayCircle, ArrowRight 
} from 'lucide-react'
import { Button } from '@/components/common/Button'

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState(1)

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.h1 
          className="font-serif text-3xl md:text-5xl text-neutral-900 dark:text-white mb-4 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          How can we assist your journey?
        </motion.h1>
        <motion.p 
          className="text-lg text-neutral-600 dark:text-neutral-400 mb-12 max-w-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Find answers, discover guides, and get in touch with our dedicated concierge team.
        </motion.p>

        {/* Search Bar */}
        <motion.div 
          className="w-full max-w-2xl relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-neutral-400" size={20} />
          </div>
          <input 
            className="w-full bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border border-neutral-200 dark:border-dark-700 rounded-full py-4 pl-12 pr-6 text-neutral-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm" 
            placeholder="Search for help..." 
            type="text"
          />
        </motion.div>
      </section>

      {/* Main Content Layout */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 lg:pr-8 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-dark-700 pb-8 lg:pb-0 mb-8 lg:mb-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
            <a className="whitespace-nowrap flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium px-4 py-3 rounded-lg transition-colors" href="#">
              <HelpCircle size={20} />
              Getting Started
            </a>
            <a className="whitespace-nowrap flex items-center gap-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-dark-800 px-4 py-3 rounded-lg transition-colors" href="#">
              <CheckCircle size={20} />
              Verification
            </a>
            <a className="whitespace-nowrap flex items-center gap-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-dark-800 px-4 py-3 rounded-lg transition-colors" href="#">
              <Edit size={20} />
              Contributions
            </a>
            <a className="whitespace-nowrap flex items-center gap-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-dark-800 px-4 py-3 rounded-lg transition-colors" href="#">
              <Star size={20} />
              Reviews
            </a>
            <a className="whitespace-nowrap flex items-center gap-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-dark-800 px-4 py-3 rounded-lg transition-colors" href="#">
              <User size={20} />
              Account
            </a>
          </nav>
        </aside>

        {/* FAQ & Content Area */}
        <div className="lg:col-span-9 flex flex-col gap-16">
          
          {/* FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="font-serif text-2xl text-neutral-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="flex flex-col border-t border-neutral-200 dark:border-dark-700">
              
              <div className="border-b border-neutral-200 dark:border-dark-700 py-4 cursor-pointer" onClick={() => toggleFaq(1)}>
                <div className="flex justify-between items-center text-lg text-neutral-900 dark:text-white font-medium">
                  How do I verify my account?
                  <ChevronDown className={`text-neutral-400 transition-transform duration-300 ${openFaq === 1 ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === 1 && (
                  <div className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <p>To verify your account, navigate to your Profile Settings and select 'Verification Status'. You will need to upload a valid government-issued ID and a recent photograph. Our team typically processes verifications within 24-48 hours to ensure the safety of our elite community.</p>
                  </div>
                )}
              </div>

              <div className="border-b border-neutral-200 dark:border-dark-700 py-4 cursor-pointer" onClick={() => toggleFaq(2)}>
                <div className="flex justify-between items-center text-lg text-neutral-900 dark:text-white font-medium">
                  How do I add a new place to the directory?
                  <ChevronDown className={`text-neutral-400 transition-transform duration-300 ${openFaq === 2 ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === 2 && (
                  <div className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <p>Verified members can contribute by clicking the 'Add Destination' button in the main navigation. You will be prompted to provide high-quality imagery, accurate location data, and a detailed description adhering to our editorial guidelines.</p>
                  </div>
                )}
              </div>

              <div className="border-b border-neutral-200 dark:border-dark-700 py-4 cursor-pointer" onClick={() => toggleFaq(3)}>
                <div className="flex justify-between items-center text-lg text-neutral-900 dark:text-white font-medium">
                  What are the guidelines for reviews?
                  <ChevronDown className={`text-neutral-400 transition-transform duration-300 ${openFaq === 3 ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === 3 && (
                  <div className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    <p>We value authentic, detailed, and respectful reviews. Please focus on the unique aspects of your experience, the quality of service, and the atmosphere. Avoid brief generic statements. All reviews are subject to moderation to maintain our standard of quality.</p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>

          {/* Help Center Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="font-serif text-2xl text-neutral-900 dark:text-white mb-6">Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-xl p-8 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <Book className="text-secondary-500 mb-2" size={32} />
                <h3 className="text-xl text-neutral-900 dark:text-white font-medium">Community Guides</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4 flex-grow">Comprehensive articles on curating the perfect itinerary and discovering hidden gems.</p>
                <a className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-2 hover:gap-3 transition-all w-fit" href="#">
                  Read Guides <ArrowRight size={16} />
                </a>
              </div>
              
              <div className="bg-white dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-xl p-8 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <PlayCircle className="text-secondary-500 mb-2" size={32} />
                <h3 className="text-xl text-neutral-900 dark:text-white font-medium">Video Tutorials</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4 flex-grow">Step-by-step visual guides on using platform features and managing your profile.</p>
                <a className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-2 hover:gap-3 transition-all w-fit" href="#">
                  Watch Now <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="bg-neutral-50 dark:bg-dark-800 rounded-xl p-8 md:p-10 border border-neutral-200 dark:border-dark-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="font-serif text-2xl text-neutral-900 dark:text-white mb-2">Still need help?</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-8">Reach out to our dedicated support team. We aim to respond within 24 hours.</p>
            
            <form className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-500 uppercase tracking-wider font-semibold" htmlFor="name">Full Name</label>
                  <input className="bg-transparent border-0 border-b border-neutral-300 dark:border-dark-600 focus:border-primary-500 focus:ring-0 px-0 py-2 text-neutral-900 dark:text-white transition-colors" id="name" type="text" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-neutral-500 uppercase tracking-wider font-semibold" htmlFor="email">Email Address</label>
                  <input className="bg-transparent border-0 border-b border-neutral-300 dark:border-dark-600 focus:border-primary-500 focus:ring-0 px-0 py-2 text-neutral-900 dark:text-white transition-colors" id="email" type="email" />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs text-neutral-500 uppercase tracking-wider font-semibold" htmlFor="topic">Topic</label>
                <select className="bg-transparent border-0 border-b border-neutral-300 dark:border-dark-600 focus:border-primary-500 focus:ring-0 px-0 py-2 text-neutral-900 dark:text-white transition-colors" id="topic">
                  <option>Account Assistance</option>
                  <option>Reporting an Issue</option>
                  <option>Contribution Guidelines</option>
                  <option>Other Inquiry</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                <label className="text-xs text-neutral-500 uppercase tracking-wider font-semibold" htmlFor="message">Message</label>
                <textarea className="bg-transparent border-0 border-b border-neutral-300 dark:border-dark-600 focus:border-primary-500 focus:ring-0 px-0 py-2 text-neutral-900 dark:text-white transition-colors resize-none" id="message" rows="4"></textarea>
              </div>
              
              <Button className="mt-6 w-full md:w-auto self-start" size="lg">
                Send Message
              </Button>
            </form>
          </motion.div>

        </div>
      </section>
    </div>
  )
}

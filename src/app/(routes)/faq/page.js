'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, HelpCircle, CheckCircle, Edit, Star, User, 
  ChevronDown, Book, PlayCircle, ArrowRight, Loader2, Check
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import apiClient from '@/lib/api'

const faqsData = {
  'Getting Started': [
    { id: 1, q: 'What is Villupuram Discovery Hub?', a: 'Villupuram Discovery Hub is a community-driven platform designed to help travelers explore both well-known tourist attractions and undiscovered hidden gems in and around the Villupuram district of Tamil Nadu.' },
    { id: 2, q: 'Is this platform free to use?', a: 'Yes! Exploring the directory, reading reviews, and using the maps is completely free for all users.' },
    { id: 3, q: 'Do I need an account to browse places?', a: 'No, you do not need an account to browse destinations, view photos, or read reviews. However, you will need to register and verify your account if you wish to contribute reviews or add new places.' },
    { id: 13, q: 'Is there a mobile app available?', a: 'Currently, Villupuram Discovery Hub is a fully responsive web application, meaning it works beautifully on any mobile browser. A dedicated native app is in our future roadmap.' },
    { id: 14, q: 'How can I share a place with my friends?', a: 'Every destination page features a "Share" button that allows you to quickly copy the link or share it directly to social media platforms like WhatsApp and Facebook.' }
  ],
  'Verification': [
    { id: 4, q: 'How do I verify my account?', a: "To verify your account, navigate to your Profile Settings and select 'Verification Status'. You will need to upload a valid government-issued ID. Our team typically processes verifications within 24-48 hours to ensure the safety of our elite community." },
    { id: 5, q: 'Why do I need to be verified?', a: 'We require verification to maintain a high-quality, spam-free environment. Verification ensures that all reviews and new place submissions come from authentic travelers and locals, preserving the integrity of the platform.' },
    { id: 15, q: 'Is my uploaded ID kept secure?', a: 'Absolutely. We use enterprise-grade encryption to process your verification documents. Once your identity is verified, the uploaded documents are permanently deleted from our active servers for your privacy.' },
    { id: 16, q: 'Can I be un-verified?', a: 'Yes, if an account violates our Community Guidelines repeatedly, verification status may be revoked and the account suspended.' }
  ],
  'Contributions': [
    { id: 6, q: 'How do I add a new place to the directory?', a: "Verified members can contribute by clicking the 'Add Place' button in their dashboard. You will be prompted to provide high-quality imagery, accurate location data, opening hours, and a detailed description adhering to our editorial guidelines." },
    { id: 7, q: 'Will my submitted place be published immediately?', a: 'No. All new place submissions go into our Admin Approval Queue. Our editorial team reviews the submission for accuracy, image quality, and appropriate formatting before it goes live on the platform.' },
    { id: 8, q: 'What kind of photos should I upload?', a: 'We require high-resolution, unwatermarked, landscape-oriented photos that clearly show the destination. Avoid heavily filtered selfies or blurry images.' },
    { id: 17, q: 'Can I edit a place I already submitted?', a: 'Yes, you can suggest edits to places you have submitted. These edits will also go through a brief approval process to maintain data integrity.' },
    { id: 18, q: 'Do I get credit for adding a place?', a: 'Yes! Places you discover and successfully add to the platform will feature your profile as the "Discovered By" or "Curator" badge.' }
  ],
  'Reviews': [
    { id: 9, q: 'What are the guidelines for reviews?', a: 'We value authentic, detailed, and respectful reviews. Please focus on the unique aspects of your experience, the quality of service, and the atmosphere. Avoid brief generic statements. All reviews are subject to moderation.' },
    { id: 10, q: 'Can I edit or delete my review?', a: 'Yes. You can manage your published reviews from your personalized User Dashboard. Edits may temporarily hide the review until re-approved by moderation.' },
    { id: 19, q: 'Why was my review rejected?', a: 'Reviews may be rejected if they contain inappropriate language, spam, personally identifiable information, or if they violate our Community Guidelines. You will receive an email explaining the specific reason.' },
    { id: 20, q: 'Can I reply to a review?', a: 'Currently, only the administrative team and the official business owner (if claimed) can reply directly to user reviews.' }
  ],
  'Account': [
    { id: 11, q: 'How do I reset my password?', a: 'Click the "Forgot Password" link on the login page and enter your registered email address. We will send you instructions to securely reset your password.' },
    { id: 12, q: 'How can I delete my account?', a: 'To permanently delete your account and remove your data, please contact our support team using the form below. For security reasons, deletion requests are handled manually.' },
    { id: 21, q: 'Can I change my username?', a: 'Yes, you can change your display name in your Profile Settings. Note that your display name is what other users see on your reviews and contributions.' },
    { id: 22, q: 'How do I manage my email preferences?', a: 'You can opt in or out of marketing emails, newsletters, and contribution updates from the "Notifications" tab within your Account Settings.' }
  ]
}

const categories = [
  { name: 'Getting Started', icon: HelpCircle },
  { name: 'Verification', icon: CheckCircle },
  { name: 'Contributions', icon: Edit },
  { name: 'Reviews', icon: Star },
  { name: 'Account', icon: User }
]

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState('Getting Started')
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  
  // Support Form State
  const [topic, setTopic] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null) // 'success' or 'error'

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  // Filter logic
  const displayedFaqs = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqsData[activeTab] || []
    }

    const lowerQuery = searchQuery.toLowerCase()
    const results = []
    
    // Search across all categories if there's a query
    Object.values(faqsData).forEach(categoryFaqs => {
      categoryFaqs.forEach(faq => {
        if (faq.q.toLowerCase().includes(lowerQuery) || faq.a.toLowerCase().includes(lowerQuery)) {
          results.push(faq)
        }
      })
    })
    
    return results
  }, [activeTab, searchQuery])

  const handleSupportSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !topic || !formData.message) {
      setSubmitStatus('error')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      await apiClient.post('/support', {
        name: formData.name,
        email: formData.email,
        topic,
        message: formData.message
      })
      
      setSubmitStatus('success')
      setFormData({ name: '', email: '', message: '' })
      setTopic('')
      
      // Clear success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000)
    } catch (error) {
      console.error("Support submission failed:", error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>
      </section>

      {/* Main Content Layout */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 lg:pr-8 border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-dark-700 pb-8 lg:pb-0 mb-8 lg:mb-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isActive = activeTab === cat.name && !searchQuery
              return (
                <button
                  key={cat.name}
                  onClick={() => {
                    setActiveTab(cat.name)
                    setSearchQuery('')
                    setOpenFaq(null)
                  }}
                  className={`whitespace-nowrap flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left
                    ${isActive 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-dark-800'}`}
                >
                  <Icon size={20} />
                  {cat.name}
                </button>
              )
            })}
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
            <h2 className="font-serif text-2xl text-neutral-900 dark:text-white mb-6">
              {searchQuery ? `Search Results for "${searchQuery}"` : `Frequently Asked Questions: ${activeTab}`}
            </h2>
            
            <div className="flex flex-col border-t border-neutral-200 dark:border-dark-700 min-h-[300px]">
              {displayedFaqs.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 dark:text-neutral-400">
                  No matching questions found. Try a different search term or contact support.
                </div>
              ) : (
                displayedFaqs.map((faq) => (
                  <div key={faq.id} className="border-b border-neutral-200 dark:border-dark-700 py-4 cursor-pointer" onClick={() => toggleFaq(faq.id)}>
                    <div className="flex justify-between items-center text-lg text-neutral-900 dark:text-white font-medium">
                      {faq.q}
                      <ChevronDown className={`text-neutral-400 transition-transform duration-300 flex-shrink-0 ml-4 ${openFaq === faq.id ? 'rotate-180' : ''}`} />
                    </div>
                    <AnimatePresence>
                      {openFaq === faq.id && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 text-neutral-600 dark:text-neutral-400 leading-relaxed pb-2">
                            <p>{faq.a}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
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
                <p className="text-neutral-600 dark:text-neutral-400 mb-4 grow">Comprehensive articles on curating the perfect itinerary and discovering hidden gems.</p>
                <a className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-2 hover:gap-3 transition-all w-fit" href="/guidelines">
                  Read Guides <ArrowRight size={16} />
                </a>
              </div>
              
              <div className="bg-white dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-xl p-8 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <PlayCircle className="text-secondary-500 mb-2" size={32} />
                <h3 className="text-xl text-neutral-900 dark:text-white font-medium">Video Tutorials</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4 grow">Step-by-step visual guides on using platform features and managing your profile.</p>
                <a className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-2 hover:gap-3 transition-all w-fit" href="#">
                  Watch Now <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            className="bg-neutral-50 dark:bg-dark-900 rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] border border-neutral-100 dark:border-dark-800 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <h2 className="font-serif text-3xl text-neutral-900 dark:text-white mb-3">Still need help?</h2>
            <p className="text-neutral-500 dark:text-neutral-400 mb-8 text-lg">Reach out to our dedicated support team. We aim to respond within 24 hours.</p>
            
            <form className="flex flex-col gap-6 relative z-10" onSubmit={handleSupportSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-neutral-700 dark:text-neutral-300 font-medium" htmlFor="name">Full Name</label>
                  <input 
                    className="w-full bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-neutral-400" 
                    id="name" 
                    type="text" 
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-neutral-700 dark:text-neutral-300 font-medium" htmlFor="email">Email Address</label>
                  <input 
                    className="w-full bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-neutral-400" 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm text-neutral-700 dark:text-neutral-300 font-medium" htmlFor="topic">Topic</label>
                <div 
                  className="w-full bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-xl px-4 py-3.5 flex justify-between items-center cursor-pointer hover:border-primary-500/50 transition-colors"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span className={topic ? "text-neutral-900 dark:text-white" : "text-neutral-400"}>
                    {topic || "Select a topic..."}
                  </span>
                  <ChevronDown className={`text-neutral-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} size={20} />
                </div>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-xl shadow-xl overflow-hidden z-20"
                    >
                      {['Account Assistance', 'Reporting an Issue', 'Contribution Guidelines', 'Other Inquiry'].map((item) => (
                        <div 
                          key={item}
                          className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-dark-700 text-neutral-700 dark:text-neutral-300 cursor-pointer transition-colors"
                          onClick={() => {
                            setTopic(item)
                            setIsDropdownOpen(false)
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm text-neutral-700 dark:text-neutral-300 font-medium" htmlFor="message">Message</label>
                <textarea 
                  className="w-full bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-xl px-4 py-3.5 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-neutral-400 resize-none" 
                  id="message" 
                  rows="4"
                  placeholder="How can we help you today?"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  required
                ></textarea>
              </div>

              {submitStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-4 rounded-xl flex items-center gap-3"
                >
                  <Check size={20} />
                  Your message has been sent successfully! Our team will reach out soon.
                </motion.div>
              )}
              
              {submitStatus === 'error' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl"
                >
                  Please fill out all fields correctly and try again.
                </motion.div>
              )}
              
              <Button 
                type="submit" 
                className="mt-2 w-full md:w-auto md:px-10 self-start shadow-lg shadow-primary-500/20 flex items-center gap-2" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </motion.div>

        </div>
      </section>
    </div>
  )
}

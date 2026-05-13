'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, Phone, MapPin, Send, MessageSquare, 
  Flag, ShieldAlert, CheckCircle, Loader2, Globe, 
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useSettingsStore } from '@/lib/store'
import apiClient from '@/lib/api'
import Link from 'next/link'

export default function ContactPage() {
  const { settings } = useSettingsStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      formData.topic = "From Contact Page"
      await apiClient.post('/support', formData)
      setSubmitted(true)
    } catch (error) {
      console.error('Submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-20">
        <div className="text-center space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="font-serif text-4xl md:text-6xl font-bold text-neutral-900 dark:text-white"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto"
          >
            Whether you have a question about hidden gems, need account assistance, or want to report a concern, our team is here for you.
          </motion.p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Col: Contact Info & Report CTA */}
        <div className="lg:col-span-5 space-y-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-10 border border-neutral-100 dark:border-dark-700 shadow-xl space-y-8"
          >
            <h3 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">Contact Information</h3>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Email Us</p>
                  <p className="text-neutral-900 dark:text-white font-medium">{settings.contactEmail || 'contact@villupuramhub.com'}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary-500/10 flex items-center justify-center text-secondary-500 shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Call Us</p>
                  <p className="text-neutral-900 dark:text-white font-medium">{settings.contactPhone || '+91 00000 00000'}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Our Base</p>
                  <p className="text-neutral-900 dark:text-white font-medium leading-relaxed">{settings.address || 'Villupuram, Tamil Nadu, India'}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-100 dark:border-dark-700 flex items-center gap-4 text-neutral-400">
              <Globe size={20} className="text-primary-500" />
              <p className="text-sm">Global support available 24/7</p>
            </div>
          </motion.div>

          {/* Report CTA Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="bg-red-500 rounded-[2.5rem] p-10 text-white shadow-xl shadow-red-500/20 relative overflow-hidden group"
          >
            <ShieldAlert className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform duration-500" />
            <h3 className="text-2xl font-serif font-bold mb-4 relative z-10">Report an Issue</h3>
            <p className="text-red-50 mb-8 relative z-10 opacity-90">
              Found incorrect data? Encountered inappropriate content? Helping us maintain integrity is just a click away.
            </p>
            <Link href="/report">
              <Button variant="ghost" className="bg-white text-red-600 hover:bg-red-50 w-full md:w-auto px-8 rounded-2xl flex items-center gap-2">
                <Flag size={18} />
                Raise a Report
                <ArrowRight size={16} />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right Col: Contact Form */}
        <div className="lg:col-span-7">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 md:p-12 border border-neutral-100 dark:border-dark-700 shadow-xl h-full"
          >
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                  <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white">Message Received</h2>
                <p className="text-neutral-600 dark:text-neutral-400 max-w-md">
                  Thank you for reaching out. A member of our team will contact you shortly via email.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline">Send Another Message</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">Send a Message</h3>
                  <p className="text-neutral-500 dark:text-neutral-400">Feel free to ask us anything.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Jane Smith"
                      className="w-full bg-neutral-50 dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="jane@example.com"
                      className="w-full bg-neutral-50 dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Subject</label>
                  <input 
                    type="text" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="How can we help?"
                    className="w-full bg-neutral-50 dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Message</label>
                  <textarea 
                    required value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={5} placeholder="Describe your inquiry..."
                    className="w-full bg-neutral-50 dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-neutral-900 dark:text-white resize-none"
                  ></textarea>
                </div>

                <Button 
                  type="submit" disabled={isSubmitting}
                  className="w-full py-5 rounded-2xl text-lg font-bold shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Send size={20} />}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

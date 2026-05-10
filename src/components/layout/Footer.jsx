'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Heart, Mail, Check, AlertCircle, Loader2 } from 'lucide-react'
import { FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa'
import apiClient from '@/lib/api'

export function Footer() {
  const authorLink = process.env.NEXT_PUBLIC_AUTHOR_LINK || '#'
  
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [message, setMessage] = useState('')

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setMessage('')

    try {
      const response = await apiClient.post('/newsletter', { email })
      setStatus('success')
      setMessage(response.data?.message || 'Successfully subscribed!')
      setEmail('')
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } catch (error) {
      setStatus('error')
      setMessage(error.response?.data?.message || 'Failed to subscribe. Please try again.')
    }
  }

  return (
    <footer className="relative bg-white dark:bg-dark-900 pt-20 pb-10 border-t border-neutral-200 dark:border-dark-800 overflow-hidden">
      {/* Premium background styling */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                <MapPin size={18} strokeWidth={2.5} />
              </div>
              <span className="font-serif text-xl font-bold text-neutral-900 dark:text-white">
                Villupuram <span className="text-primary-500 font-light italic">Hub</span>
              </span>
            </Link>
            <p className="text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
              Unearthing hidden gems, celebrating rich heritage, and curating unparalleled experiences in the heart of Tamil Nadu.
            </p>
            <div className="flex items-center gap-4 text-neutral-400">
              <a href="#" className="hover:text-primary-500 transition-colors"><FaTwitter size={20} /></a>
              <a href="#" className="hover:text-primary-500 transition-colors"><FaInstagram size={20} /></a>
              <a href="#" className="hover:text-primary-500 transition-colors"><FaGithub size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-medium text-neutral-900 dark:text-white mb-6">Quick Links</h3>
            <ul className="flex flex-col gap-4 text-neutral-600 dark:text-neutral-400 font-light">
              <li><Link href="/explore" className="hover:text-primary-500 transition-colors">Explore Places</Link></li>
              <li><Link href="/about" className="hover:text-primary-500 transition-colors">Our Story</Link></li>
              <li><Link href="/guidelines" className="hover:text-primary-500 transition-colors">Community Guidelines</Link></li>
              <li><Link href="/faq" className="hover:text-primary-500 transition-colors">Help & FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-medium text-neutral-900 dark:text-white mb-6">Legal</h3>
            <ul className="flex flex-col gap-4 text-neutral-600 dark:text-neutral-400 font-light">
              <li><Link href="/terms" className="hover:text-primary-500 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-primary-500 transition-colors">Cookie Policy</Link></li>
              <li><Link href="/accessibility" className="hover:text-primary-500 transition-colors">Accessibility</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Stay Updated</h3>
            <p className="text-neutral-600 dark:text-neutral-400 font-light text-sm mb-2">
              Subscribe to our newsletter for the latest hidden gems.
            </p>
            
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <div className="flex relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-neutral-400" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address" 
                  required
                  disabled={status === 'loading'}
                  className="w-full bg-neutral-50 dark:bg-dark-900 border border-neutral-200 dark:border-dark-800 rounded-l-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-neutral-900 dark:text-white disabled:opacity-70"
                />
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 rounded-r-xl transition-colors text-sm font-medium flex items-center justify-center disabled:opacity-70 disabled:hover:bg-primary-500 min-w-[70px]"
                >
                  {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : 'Join'}
                </button>
              </div>
              
              {/* Status Messages */}
              {status === 'success' && (
                <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mt-1">
                  <Check size={14} />
                  <span>{message}</span>
                </div>
              )}
              {status === 'error' && (
                <div className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 mt-1">
                  <AlertCircle size={14} />
                  <span>{message}</span>
                </div>
              )}
            </form>
            
          </div>
        </div>

        <div className="h-px bg-neutral-200 dark:bg-dark-800 w-full mb-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400 font-light">
          <p>&copy; {new Date().getFullYear()} Villupuram Travel Community.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> by 
            <a href={authorLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Elamaran
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

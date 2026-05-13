'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, MapPin, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [stats, setStats] = useState({ places: '120+', members: '1.2K', visitors: '8K' })
  const { login, isLoading } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'

  useEffect(() => {
    fetch('/api/stats/public')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const { totalPlaces, totalUsers, monthlyVisitors } = json.data
          setStats({
            places: totalPlaces > 0 ? `${totalPlaces}+` : '120+',
            members: totalUsers >= 1000 ? `${(totalUsers/1000).toFixed(1)}K` : `${totalUsers}`,
            visitors: monthlyVisitors >= 1000 ? `${(monthlyVisitors/1000).toFixed(1)}K` : `${monthlyVisitors}`
          })
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(email, password)
      toast.success('Welcome back!')
      router.push(from)
    } catch (err) {
      toast.error(err.message || 'Invalid email or password')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-700 via-secondary-600 to-primary-900 overflow-hidden items-center justify-center p-12">
        {/* Blurred circles */}
        <div className="absolute top-[-80px] left-[-80px] w-96 h-96 bg-primary-400/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 bg-secondary-400/20 rounded-full blur-3xl" />
        {/* Content */}
        <motion.div
          className="relative text-white max-w-md"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <MapPin size={22} className="text-white" />
            </div>
            <span className="font-serif text-2xl font-bold">Villupuram <span className="italic font-light">Hub</span></span>
          </div>
          <h2 className="text-4xl font-serif font-bold leading-tight mb-4">
            Discover the heritage of Villupuram District
          </h2>
          <p className="text-white/70 leading-relaxed">
            Join our community of explorers, historians, and travellers preserving the hidden gems of Tamil Nadu.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              [stats.places, 'Places'], 
              [stats.members, 'Members'], 
              [stats.visitors, 'Visitors']
            ].map(([v, l]) => (
              <div key={l} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                <p className="font-serif font-bold text-2xl">{v}</p>
                <p className="text-white/60 text-xs mt-1">{l}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
              <MapPin size={18} className="text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-primary-600 dark:text-primary-400">Villupuram <span className="text-neutral-800 dark:text-white font-light italic">Hub</span></span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 placeholder:text-neutral-400 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type={showPw ? 'text' : 'password'} required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-neutral-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Sign In</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-neutral-500 dark:text-neutral-400">
            New to Villupuram Hub?{' '}
            <Link href="/auth/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

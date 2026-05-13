'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, MapPin, User, ArrowRight, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const PERKS = [
  'Add hidden places to the community map',
  'Write reviews visible to all visitors',
  'Track your contribution status',
  'Help preserve Villupuram\'s heritage',
]

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const { register, isLoading } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    try {
      await register(email, password, username)
      toast.success('Account created! Welcome to the community.')
      router.push('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-secondary-700 via-primary-600 to-secondary-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute top-[-60px] right-[-60px] w-96 h-96 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-80px] left-[-80px] w-80 h-80 bg-secondary-300/20 rounded-full blur-3xl" />
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
            Join the community of heritage explorers
          </h2>
          <p className="text-white/70 mb-8 leading-relaxed">
            Create your free account and start contributing to the preservation of Villupuram's rich cultural heritage.
          </p>
          <div className="space-y-3">
            {PERKS.map((perk) => (
              <div key={perk} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-white" />
                </div>
                <p className="text-white/80 text-sm">{perk}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right — form */}
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
            <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-2">Create your account</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Free forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text" required value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 placeholder:text-neutral-400 transition-all"
                />
              </div>
            </div>

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
                  placeholder="Min. 6 characters"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-neutral-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-neutral-900 dark:text-white text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex gap-1">
                  {[6, 8, 12].map((len) => (
                    <div key={len} className={`flex-1 h-1 rounded-full transition-colors ${
                      password.length >= len ? 'bg-primary-500' : 'bg-neutral-200 dark:bg-dark-600'
                    }`} />
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 mt-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Create Account</span><ArrowRight size={16} /></>
              )}
            </button>

            <p className="text-center text-xs text-neutral-400">
              By registering you agree to our{' '}
              <Link href="/terms" className="text-primary-500 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-primary-500 hover:underline">Privacy Policy</Link>
            </p>
          </form>

          <p className="text-center mt-5 text-sm text-neutral-500 dark:text-neutral-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import { Lock, User, Eye, EyeOff, Shield, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [step, setStep] = useState('token') // 'token' → 'credentials'
  const [accessToken, setAccessToken] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const setToken = (token) => {
    useAuthStore.setState({ token })
    localStorage.setItem('auth_token', token)
  }

  // Step 1 — verify access token
  const handleTokenSubmit = (e) => {
    e.preventDefault()
    if (!accessToken.trim()) return
    // We don't validate the token client-side — server does.
    // Just move to credentials step.
    setStep('credentials')
  }

  // Step 2 — username + password login
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, accessToken }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Login failed')

      // Persist in Zustand
      useAuthStore.setState({ user: data.data.user, token: data.data.token })
      localStorage.setItem('auth_token', data.data.token)

      toast.success('Access granted')
      router.push('/admin')
    } catch (err) {
      toast.error(err.message || 'Authentication failed')
      // On credentials failure, stay on credentials step
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-900/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative w-full max-w-sm"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Card */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
              <Shield size={26} className="text-primary-400" />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'token' ? (
              <motion.div key="token"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-xl font-serif font-bold text-white text-center mb-1">Restricted Area</h1>
                <p className="text-neutral-500 text-xs text-center mb-7">Enter the access token to continue</p>

                <form onSubmit={handleTokenSubmit} className="space-y-4">
                  <div className="relative">
                    <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="password"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      placeholder="Access token"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Continue
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="creds"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-xl font-serif font-bold text-white text-center mb-1">Admin Sign In</h1>
                <p className="text-neutral-500 text-xs text-center mb-7">Username and password required</p>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Admin username"
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-600/10 transition-all"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    {loading
                      ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Sign In'
                    }
                  </button>

                  <button type="button" onClick={() => setStep('token')}
                    className="w-full text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
                    ← Back
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mt-5">
          {['token', 'credentials'].map((s, i) => (
            <div key={s} className={`w-1.5 h-1.5 rounded-full transition-colors ${step === s ? 'bg-primary-500' : 'bg-neutral-700'}`} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}

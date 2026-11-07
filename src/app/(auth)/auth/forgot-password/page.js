'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { MapPin } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault(); setBusy(true)
    try {
      const response = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) })
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error || 'Request failed')
      toast.success(json.data?.message || 'If an account exists, a reset code will be sent.')
      window.location.assign(`/auth/reset-password?email=${encodeURIComponent(email.trim().toLowerCase())}`)
    } catch (error) { toast.error(error.message) } finally { setBusy(false) }
  }
  return <main className="min-h-screen bg-neutral-50 dark:bg-dark-900 flex items-center justify-center px-4 py-10"><section className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 p-7 shadow-xl">
    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-7"><MapPin size={20}/><span className="font-serif font-bold">Villupuram Trails</span></div>
    <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">Forgot password?</h1><p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">Enter your account email. If it matches an account, we’ll send a reset code.</p>
    <form onSubmit={submit} className="space-y-4"><label className="block text-sm text-neutral-600 dark:text-neutral-300">Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-dark-600 bg-transparent px-3 py-3" /></label><button disabled={busy} className="w-full rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 disabled:opacity-60">{busy ? 'Please wait…' : 'Send reset code'}</button></form>
    <p className="mt-5 text-center text-sm text-neutral-500"><Link href="/auth/login" className="text-primary-600 font-semibold">Return to sign in</Link></p>
  </section></main>
}

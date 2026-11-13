'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { MapPin } from 'lucide-react'

function ResetPasswordForm() {
  const params = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState(params.get('email') || '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event) {
    event.preventDefault()
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    setBusy(true)
    try {
      const response = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, code, password }) })
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.error || 'Unable to reset password')
      toast.success(json.data?.message || 'Password updated. You can sign in.')
      router.push('/auth/login')
    } catch (error) { toast.error(error.message) } finally { setBusy(false) }
  }
  return <main className="min-h-screen bg-neutral-50 dark:bg-dark-900 flex items-center justify-center px-4 py-10"><section className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 p-7 shadow-xl">
    <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-7"><MapPin size={20}/><span className="font-serif font-bold">Oor Thadam</span></div>
    <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">Reset your password</h1><p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">Enter the code sent to your email and choose a new password.</p>
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm text-neutral-600 dark:text-neutral-300">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-dark-600 bg-transparent px-3 py-3" /></label>
      <label className="block text-sm text-neutral-600 dark:text-neutral-300">Six digit reset code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-dark-600 bg-transparent px-3 py-3 text-center tracking-[0.5em]" /></label>
      <label className="block text-sm text-neutral-600 dark:text-neutral-300">New password<input required type="password" minLength={12} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-dark-600 bg-transparent px-3 py-3" /></label>
      <label className="block text-sm text-neutral-600 dark:text-neutral-300">Confirm new password<input required type="password" minLength={12} autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-dark-600 bg-transparent px-3 py-3" /></label>
      <button disabled={busy} className="w-full rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 disabled:opacity-60">{busy ? 'Please wait…' : 'Set new password'}</button>
    </form><p className="mt-5 text-center text-sm text-neutral-500"><Link href="/auth/forgot-password" className="text-primary-600 font-semibold">Request another code</Link></p>
  </section></main>
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="min-h-screen bg-neutral-50 dark:bg-dark-900"/>}><ResetPasswordForm /></Suspense>
}

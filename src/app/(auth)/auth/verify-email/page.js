'use client'

import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Mail, MapPin } from 'lucide-react'

function VerifyEmailForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  async function post(path, body) {
    const response = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    const json = await response.json()
    if (!response.ok || !json.success) throw new Error(json.error || 'Request failed')
    return json
  }

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    try {
      const result = await post('/api/auth/verify-email', { email, code })
      toast.success(result.data?.message || 'Email verified.')
      router.push('/auth/login')
    } catch (error) { toast.error(error.message) } finally { setBusy(false) }
  }

  async function resend() {
    setBusy(true)
    try {
      const result = await post('/api/auth/resend-verification', { email })
      toast.success(result.data?.message || 'If the account needs verification, a code will be sent shortly.')
    } catch (error) { toast.error(error.message) } finally { setBusy(false) }
  }

  return <main className="min-h-screen bg-neutral-50 dark:bg-dark-900 flex items-center justify-center px-4 py-10">
    <section className="w-full max-w-md rounded-2xl bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 p-7 shadow-xl">
      <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 mb-7"><MapPin size={20}/><span className="font-serif font-bold">Oor Thadam</span></div>
      <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">Verify your email</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-6">Enter the six digit code we sent you. It expires in 10 minutes.</p>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm text-neutral-600 dark:text-neutral-300">Email<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-dark-600 bg-transparent px-3 py-3" /></label>
        <label className="block text-sm text-neutral-600 dark:text-neutral-300">Verification code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g, '').slice(0,6))} className="mt-1 w-full rounded-xl border border-neutral-200 dark:border-dark-600 bg-transparent px-3 py-3 text-center tracking-[0.5em]" /></label>
        <button disabled={busy} className="w-full rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 disabled:opacity-60">{busy ? 'Please wait…' : 'Verify email'}</button>
      </form>
      <button disabled={busy || !email} onClick={resend} className="w-full mt-3 rounded-xl border border-neutral-200 dark:border-dark-600 py-3 text-sm font-medium text-neutral-700 dark:text-neutral-200 disabled:opacity-50"><Mail size={15} className="inline mr-2"/>Resend code</button>
      <p className="mt-5 text-center text-sm text-neutral-500">Already verified? <Link href="/auth/login" className="text-primary-600 font-semibold">Sign in</Link></p>
    </section>
  </main>
}

export default function VerifyEmailPage() {
  return <Suspense fallback={<main className="min-h-screen bg-neutral-50 dark:bg-dark-900"/>}><VerifyEmailForm /></Suspense>
}

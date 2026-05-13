'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Send, Loader2, CheckCircle2, ShieldAlert, Flag, Info } from 'lucide-react'
import { Button } from '@/components/common/Button'
import { useAuthStore } from '@/lib/store'
import { useRouter, useSearchParams } from 'next/navigation'
import apiClient from '@/lib/api'
import { SearchableSelect } from '@/components/common/SearchableSelect'

const reportTypeOptions = [
  { value: 'review', label: 'Review / Feedback' },
  { value: 'place', label: 'Place Information' },
  { value: 'user', label: 'User Profile' },
  { value: 'other', label: 'Other / General' }
]

const reasonOptions = [
  { value: 'spam', label: 'Spam or Misleading' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'fake', label: 'Fake / Fabricated Data' },
  { value: 'harassment', label: 'Harassment or Hate Speech' },
  { value: 'copyright', label: 'Copyright Violation' },
  { value: 'offensive', label: 'Offensive Language' },
  { value: 'duplicate', label: 'Duplicate Content' },
  { value: 'privacy', label: 'Privacy Violation' },
  { value: 'other', label: 'Other' }
]

export default function ReportPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const targetId = searchParams.get('id')
  const targetType = searchParams.get('type') || 'other'
  
  const [form, setForm] = useState({
    type: targetType,
    targetId: targetId || '',
    reason: '',
    description: '',
    name: '',
    email: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.reason) return
    setIsSubmitting(true)
    try {
      const { data } = await apiClient.post('/reports', form)
      if (data.success) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Report submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-dark-800 rounded-[2.5rem] p-10 text-center shadow-2xl border border-neutral-100 dark:border-dark-700"
        >
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white mb-4">Report Submitted</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
            Thank you for helping us keep our community safe. Our moderation team will review your report within 24-48 hours.
          </p>
          <Button onClick={() => router.push('/')} className="w-full py-4 rounded-2xl">Return to Home</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-bold mb-4 uppercase tracking-widest">
            <ShieldAlert size={16} />
            Community Integrity
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">Raise a Report</h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-xl mx-auto">
            Help us maintain the highest standards of safety and authenticity in Villupuram Hub.
          </p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white dark:bg-dark-800 rounded-[2rem] p-8 md:p-12 shadow-xl border border-neutral-200 dark:border-dark-700 space-y-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Custom Report Type Dropdown */}
            <SearchableSelect 
              label="Report Type"
              options={reportTypeOptions}
              value={form.type}
              onChange={(val) => setForm({...form, type: val})}
              placeholder="What are you reporting?"
            />

            {/* Custom Reason Dropdown */}
            <SearchableSelect 
              label="Reason for Reporting"
              options={reasonOptions}
              value={form.reason}
              onChange={(val) => setForm({...form, reason: val})}
              placeholder="Select a reason..."
            />
          </div>

          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Your Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full bg-neutral-50 dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-neutral-900 dark:text-white"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Your Email</label>
                <input 
                  type="email" 
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full bg-neutral-50 dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-neutral-900 dark:text-white"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Description</label>
            <textarea 
              rows={5}
              placeholder="Please provide specific details about why you are reporting this..."
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              className="w-full bg-neutral-50 dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-neutral-900 dark:text-white resize-none"
              required
            ></textarea>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-6 rounded-2xl flex gap-4">
            <Info className="text-amber-500 shrink-0" size={24} />
            <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              Misuse of the reporting system may result in account suspension. Please ensure your report is accurate and contains sufficient evidence.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || !form.reason}
            className="w-full py-5 rounded-2xl text-lg font-bold shadow-xl shadow-primary-500/20 flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Flag size={20} />
                Submit Report
              </>
            )}
          </Button>
        </motion.form>
      </div>
    </div>
  )
}

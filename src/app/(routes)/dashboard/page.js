'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { MapPin, MessageSquare, Clock, CheckCircle, XCircle, Eye, Trash2, ChevronRight } from 'lucide-react'

const STATUS_CONFIG = {
  Approved: { label: 'Approved', cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  Pending:  { label: 'Pending Review', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  Rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.cls}`}>
      <Icon size={11} /> {cfg.label}
    </span>
  )
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const [data, setData] = useState(null)
  const [activeTab, setActiveTab] = useState('places')
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const t = token || localStorage.getItem('auth_token')
    if (!t) return
    fetch('/api/dashboard/my-contributions', {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data) })
      .catch(() => {})
  }, [token])

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Delete this review permanently?')) return
    const t = token || localStorage.getItem('auth_token')
    setDeletingId(reviewId)
    try {
      await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` },
      })
      setData(prev => ({ ...prev, reviews: prev.reviews.filter(r => r._id !== reviewId) }))
    } catch {}
    setDeletingId(null)
  }

  const stats = [
    { label: 'Places Added', value: data?.stats.placesAdded ?? 0, icon: '📍' },
    { label: 'Approved',     value: data?.stats.placesApproved ?? 0, icon: '✅' },
    { label: 'Pending',      value: data?.stats.placesPending ?? 0, icon: '⏳' },
    { label: 'Reviews',      value: data?.stats.reviewsWritten ?? 0, icon: '📝' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900">
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 border-b border-neutral-200/60 dark:border-dark-800/60 bg-white dark:bg-dark-900">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-1">
              My Dashboard
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Welcome back, <span className="font-semibold text-primary-600 dark:text-primary-400">{user?.username}</span>. Track your contributions and their status.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Stats */}
        <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          {stats.map((s) => (
            <div key={s.label} className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-4 text-center shadow-sm">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold font-serif text-neutral-900 dark:text-white">{s.value}</div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div>
          <div className="flex border-b border-neutral-200 dark:border-dark-700 mb-6">
            {['places', 'reviews'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                }`}>
                {tab === 'places' ? `My Places (${data?.stats.placesAdded ?? 0})` : `My Reviews (${data?.stats.reviewsWritten ?? 0})`}
              </button>
            ))}
            <div className="ml-auto flex items-center pb-3">
              <Link href="/contribute"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-xl transition-colors">
                <MapPin size={13} /> Add Place
              </Link>
            </div>
          </div>

          {/* My Places */}
          {activeTab === 'places' && (
            <div>
              {!data ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-neutral-100 dark:bg-dark-700 rounded-xl animate-pulse" />)}
                </div>
              ) : data.places.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-3xl mb-3">📍</p>
                  <p className="font-serif font-bold text-lg text-neutral-800 dark:text-white mb-1">No places yet</p>
                  <p className="text-sm text-neutral-500 mb-4">Share a hidden gem in Villupuram with the community.</p>
                  <Link href="/contribute" className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors">
                    Add Your First Place
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.places.map(place => (
                    <div key={place._id} className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-4 flex items-center gap-4 shadow-sm">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-primary-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{place.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{place.category} · Added {new Date(place.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={place.status} />
                        {place.status === 'Approved' && (
                          <Link href={`/explore/${place._id}`} className="p-1.5 text-neutral-400 hover:text-primary-500 transition-colors">
                            <Eye size={15} />
                          </Link>
                        )}
                        <Link href={`/contribute?edit=${place._id}`} className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5">
                          Edit <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Reviews */}
          {activeTab === 'reviews' && (
            <div>
              {!data ? (
                <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-16 bg-neutral-100 dark:bg-dark-700 rounded-xl animate-pulse" />)}</div>
              ) : data.reviews.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-3xl mb-3">📝</p>
                  <p className="font-serif font-bold text-lg text-neutral-800 dark:text-white mb-1">No reviews yet</p>
                  <p className="text-sm text-neutral-500">Explore places and share your experience.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.reviews.map(review => (
                    <div key={review._id} className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="flex gap-0.5">
                              {[1,2,3,4,5].map(s => (
                                <span key={s} className={`text-xs ${s <= review.rating ? 'text-primary-400' : 'text-neutral-300'}`}>★</span>
                              ))}
                            </span>
                            {!review.visible && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs rounded-full font-medium">Hidden by admin</span>
                            )}
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">{review.comment}</p>
                          <p className="text-xs text-neutral-400 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deletingId === review._id}
                          className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-40 shrink-0"
                          title="Delete review"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

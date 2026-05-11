'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { Star, Trash2, User, EyeOff, Eye } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export function PlaceReviews({ placeId }) {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.token)
  const isAdmin = user?.role === 'admin'

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hovered, setHovered] = useState(0)

  const authHeader = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token || localStorage.getItem('auth_token') || ''}`,
  })

  useEffect(() => {
    if (!placeId) return
    fetch(`/api/places/${placeId}/reviews`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => setReviews(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [placeId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/places/${placeId}/reviews`, {
        method: 'POST',
        headers: authHeader(),
        body: JSON.stringify({ rating, comment }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Failed')
      setReviews(prev => [data.data, ...prev])
      setComment('')
      setRating(5)
      toast.success('Review submitted!')
    } catch (err) {
      toast.error(err.message || 'Failed to submit review')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE', headers: authHeader(),
      })
      if ((await res.json()).success) {
        setReviews(prev => prev.filter(r => r._id !== reviewId))
        toast.success('Review deleted')
      }
    } catch { toast.error('Failed to delete') }
  }

  const handleToggleVisibility = async (reviewId, currentVisible) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: authHeader(),
        body: JSON.stringify({ visible: !currentVisible }),
      })
      if ((await res.json()).success) {
        setReviews(prev => prev.map(r => r._id === reviewId ? { ...r, visible: !currentVisible } : r))
        toast.success(currentVisible ? 'Review hidden' : 'Review visible')
      }
    } catch { toast.error('Failed to update visibility') }
  }

  return (
    <div>
      {/* Review form — auth required */}
      {user ? (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-5 mb-6 shadow-sm">
          <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm mb-3">Write a Review</p>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(s => (
              <button type="button" key={s} onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
                className="transition-transform hover:scale-110">
                <Star size={20} className={(hovered || rating) >= s ? 'fill-primary-400 text-primary-400' : 'text-neutral-300'} />
              </button>
            ))}
          </div>
          <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Share your experience…"
            className="w-full rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-700 text-neutral-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:border-primary-500 resize-none transition-all" />
          <button type="submit" disabled={submitting || !comment.trim()}
            className="mt-3 w-full py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors">
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      ) : (
        <div className="bg-neutral-50 dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-5 mb-6 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">Sign in to write a review</p>
          <Link href="/auth/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors">
            Sign In
          </Link>
        </div>
      )}

      {/* Review list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 bg-neutral-100 dark:bg-dark-700 rounded-xl animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-center text-neutral-500 text-sm py-6">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <div key={r._id || i}
              className={`bg-white dark:bg-dark-800 rounded-2xl border p-4 shadow-sm transition-opacity ${
                !r.visible ? 'opacity-60 border-red-200 dark:border-red-900/40' : 'border-neutral-200 dark:border-dark-700'
              }`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                  <User size={14} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-neutral-900 dark:text-white">{r.author || 'Anonymous'}</span>
                      {!r.visible && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs rounded font-medium">Hidden</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} className={s <= (r.rating || 0) ? 'fill-primary-400 text-primary-400' : 'text-neutral-300'} />
                        ))}
                      </div>
                      {/* Owner or admin can delete */}
                      {(user?._id?.toString() === r.userId?.toString() || isAdmin) && (
                        <button onClick={() => handleDelete(r._id)}
                          className="p-1 text-neutral-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      )}
                      {/* Admin visibility toggle */}
                      {isAdmin && (
                        <button onClick={() => handleToggleVisibility(r._id, r.visible)}
                          className={`p-1 transition-colors ${r.visible ? 'text-neutral-400 hover:text-amber-500' : 'text-red-400 hover:text-green-500'}`}
                          title={r.visible ? 'Hide review' : 'Show review'}>
                          {r.visible ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{r.comment}</p>
                  {r.createdAt && <p className="text-xs text-neutral-400 mt-1.5">{new Date(r.createdAt).toLocaleDateString()}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

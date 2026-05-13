'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { 
  MessageSquare, Search, RefreshCw, ChevronLeft, ChevronRight, 
  Trash2, Edit2, Eye, EyeOff, Star, ExternalLink, X, Save
} from 'lucide-react'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { WithPermission, Perm } from '@/components/admin/WithPermission'

export default function AdminReviewsPage() {
  const token = useAuthStore((s) => s.token)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [visible, setVisible] = useState('') // 'true', 'false', or ''
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const [editing, setEditing] = useState(null) // ID of review being edited
  const [editForm, setEditForm] = useState({ comment: '', rating: 5, visible: true })
  const [deleting, setDeleting] = useState(null)
  const LIMIT = 15

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    const t = token || localStorage.getItem('auth_token')
    const params = new URLSearchParams({ page: p, limit: LIMIT })
    if (search) params.set('search', search)
    if (visible) params.set('visible', visible)
    
    try {
      const res = await fetch(`/api/admin/reviews?${params}`, { headers: { Authorization: `Bearer ${t}` } })
      const d = await res.json()
      if (d.success) {
        setReviews(d.data.reviews || [])
        setTotal(d.data.total || 0)
      }
    } catch { toast.error('Failed to load reviews') }
    setLoading(false)
  }, [token, search, visible])

  useEffect(() => { setPage(1); load(1) }, [token, visible])

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleDelete = async (id, author) => {
    if (!confirm(`Delete review by "${author}"?`)) return
    setDeleting(id)
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${t}` } })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      setReviews(prev => prev.filter(r => r._id !== id))
      toast.success('Review deleted')
    } catch (err) { toast.error(err.message || 'Delete failed') }
    setDeleting(null)
  }

  const startEdit = (review) => {
    setEditing(review._id)
    setEditForm({
      comment: review.comment,
      rating: review.rating,
      visible: review.visible
    })
  }

  const handleUpdate = async (id) => {
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify(editForm),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      
      setReviews(prev => prev.map(r => r._id === id ? { ...r, ...editForm } : r))
      setEditing(null)
      toast.success('Review updated ✓')
    } catch (err) { toast.error(err.message || 'Update failed') }
  }

  const pages = Math.ceil(total / LIMIT)

  return (
    <WithPermission module="reviews" action="view">
      <div className="max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Reviews</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Manage and moderate user-submitted reviews across all locations.</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search content or author…"
              className="pl-8 pr-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 rounded-xl focus:outline-none focus:border-primary-500 text-neutral-900 dark:text-white w-64" />
          </div>
          <div className="flex gap-2">
            {['', 'true', 'false'].map(v => (
              <button key={v} onClick={() => setVisible(v)}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  visible === v
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white dark:bg-dark-800 border-neutral-200 dark:border-dark-600 text-neutral-600 dark:text-neutral-400 hover:border-primary-400'
                }`}>{v === '' ? 'All' : v === 'true' ? 'Visible' : 'Hidden'}</button>
            ))}
          </div>
          <button onClick={() => load(page)} className="ml-auto p-2.5 rounded-xl text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-dark-700 bg-neutral-50 dark:bg-dark-900/50">
                  {['Author & Place', 'Review Content', 'Rating', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-dark-700">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-6 py-8">
                      <div className="h-12 bg-neutral-100 dark:bg-dark-700 rounded-xl animate-pulse" />
                    </td></tr>
                  ))
                ) : reviews.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-400 text-sm">No reviews found.</td></tr>
                ) : reviews.map((review) => {
                  const isEditing = editing === review._id
                  return (
                    <tr key={review._id} className="hover:bg-neutral-50 dark:hover:bg-dark-800/60 transition-colors">
                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-neutral-900 dark:text-white">{review.author}</p>
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                            {review.place?.name || 'Unknown Place'}
                          </p>
                          <p className="text-[10px] text-neutral-300">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <textarea 
                            value={editForm.comment}
                            onChange={e => setEditForm({ ...editForm, comment: e.target.value })}
                            className="w-full p-2 text-sm bg-neutral-50 dark:bg-dark-700 border border-neutral-200 dark:border-dark-600 rounded-lg focus:outline-none"
                            rows={3}
                          />
                        ) : (
                          <p className="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-3">
                            {review.comment}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <select 
                            value={editForm.rating}
                            onChange={e => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                            className="p-1 text-sm bg-neutral-50 dark:bg-dark-700 border border-neutral-200 dark:border-dark-600 rounded"
                          >
                            {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                          </select>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star size={14} className="fill-current" />
                            <span className="text-sm font-bold">{review.rating}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <button 
                            onClick={() => setEditForm({ ...editForm, visible: !editForm.visible })}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold transition-colors ${
                              editForm.visible 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {editForm.visible ? <Eye size={12}/> : <EyeOff size={12}/>}
                            {editForm.visible ? 'Visible' : 'Hidden'}
                          </button>
                        ) : (
                          <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full ${
                            review.visible 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {review.visible ? 'VISIBLE' : 'HIDDEN'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button onClick={() => handleUpdate(review._id)}
                                className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Save">
                                <Save size={15} />
                              </button>
                              <button onClick={() => setEditing(null)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors" title="Cancel">
                                <X size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <Perm module="reviews" action="edit">
                                <button onClick={() => startEdit(review)}
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
                                  <Edit2 size={15} />
                                </button>
                              </Perm>
                              <Perm module="reviews" action="delete">
                                <button onClick={() => handleDelete(review._id, review.author)} disabled={deleting === review._id}
                                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40" title="Delete">
                                  {deleting === review._id ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
                                </button>
                              </Perm>
                            </>
                          )}
                          <Link href={`/explore/${review.placeId}`} target="_blank"
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="View Place">
                            <ExternalLink size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100 dark:border-dark-700">
              <p className="text-xs text-neutral-400">{total} reviews · page {page} of {pages}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); load(p) }}
                  className="p-2 rounded-lg border border-neutral-200 dark:border-dark-600 disabled:opacity-40 hover:border-primary-400 transition-colors text-neutral-600 dark:text-neutral-400">
                  <ChevronLeft size={14} />
                </button>
                <button disabled={page >= pages} onClick={() => { const p = page + 1; setPage(p); load(p) }}
                  className="p-2 rounded-lg border border-neutral-200 dark:border-dark-600 disabled:opacity-40 hover:border-primary-400 transition-colors text-neutral-600 dark:text-neutral-400">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </WithPermission>
  )
}

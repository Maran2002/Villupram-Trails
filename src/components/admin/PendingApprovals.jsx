'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Check, X, Eye, MapPin, MessageSquare, RefreshCw, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  Pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function PendingApprovals({ compact = false }) {
  const token = useAuthStore((s) => s.token)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch('/api/admin/approvals', { headers: { Authorization: `Bearer ${t}` } })
      const d = await res.json()
      if (d.success) setItems(d.data || [])
    } catch { toast.error('Failed to load approvals') }
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  const handleAction = async (itemId, type, action) => {
    setActing(itemId + action)
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ itemId, type, action }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setItems(prev => prev.filter(x => x._id !== itemId))
      toast.success(`${type} ${action === 'approve' ? 'approved ✓' : 'rejected'}`)
    } catch (err) {
      toast.error(err.message || 'Action failed')
    }
    setActing(null)
  }

  const limit = compact ? 5 : items.length

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-dark-700">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-primary-500" />
          <h3 className="font-serif font-bold text-neutral-900 dark:text-white">Pending Approvals</h3>
          {!loading && <span className="ml-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold rounded-full">{items.length}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
            <RefreshCw size={14} />
          </button>
          {compact && items.length > 5 && (
            <Link href="/admin/approvals" className="text-xs text-primary-500 hover:underline">View all →</Link>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-neutral-100 dark:bg-dark-700 rounded-xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="py-14 text-center">
          <Check size={28} className="mx-auto text-green-400 mb-2" />
          <p className="text-neutral-400 text-sm">All clear — no pending approvals 🎉</p>
        </div>
      ) : (
        <div className="divide-y divide-neutral-100 dark:divide-dark-700">
          {items.slice(0, limit).map((item) => (
            <motion.div key={item._id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-dark-800/60 transition-colors"
            >
              <div className={`p-2 rounded-lg shrink-0 ${item.type === 'Place' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-500'}`}>
                {item.type === 'Place' ? <MapPin size={14} /> : <MessageSquare size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                  {item.name || item.comment?.slice(0, 60) || '—'}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${STATUS_BADGE[item.status] || STATUS_BADGE.Pending}`}>{item.type}</span>
                  {item.submittedBy?.username && <span className="text-xs text-neutral-400">by {item.submittedBy.username}</span>}
                  <span className="text-xs text-neutral-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
              {item.type === 'Place' && (
                <Link href={`/explore/${item._id}`} target="_blank"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors shrink-0">
                  <ExternalLink size={13} />
                </Link>
              )}
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => handleAction(item._id, item.type, 'approve')}
                  disabled={!!acting}
                  className="p-2 rounded-xl bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 transition-colors disabled:opacity-50"
                  title="Approve">
                  {acting === item._id + 'approve' ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                </button>
                <button
                  onClick={() => handleAction(item._id, item.type, 'reject')}
                  disabled={!!acting}
                  className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                  title="Reject">
                  {acting === item._id + 'reject' ? <RefreshCw size={13} className="animate-spin" /> : <X size={13} />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

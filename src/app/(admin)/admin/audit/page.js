'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Activity, User, MapPin, MessageSquare, Shield, Filter } from 'lucide-react'

const ACTION_ICONS = {
  'place.create': MapPin,
  'place.edit': MapPin,
  'place.admin_edit': Shield,
  'place.delete': MapPin,
  'place.approve': MapPin,
  'place.reject': MapPin,
  'review.create': MessageSquare,
  'review.delete': MessageSquare,
  'review.hide': MessageSquare,
  'review.show': MessageSquare,
}

const ACTION_LABELS = {
  'place.create': 'Added a place',
  'place.edit': 'Edited their place',
  'place.admin_edit': 'Admin-edited a place',
  'place.delete': 'Deleted a place',
  'place.approve': 'Approved a place',
  'place.reject': 'Rejected a place',
  'review.create': 'Posted a review',
  'review.delete': 'Deleted a review',
  'review.hide': 'Hid a review',
  'review.show': 'Made review visible',
}

const ACTION_COLORS = {
  create: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  approve: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  show: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  edit: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  admin_edit: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  delete: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  reject: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  hide: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
}

function getActionColor(action) {
  const verb = action?.split('.')[1] || ''
  return ACTION_COLORS[verb] || 'bg-neutral-100 text-neutral-600 dark:bg-dark-700 dark:text-neutral-400'
}

export default function AuditTrailPage() {
  const token = useAuthStore((s) => s.token)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchLogs = async (p = 1) => {
    setLoading(true)
    const t = token || localStorage.getItem('auth_token')
    const params = new URLSearchParams({ page: p, limit: 30 })
    if (filter) params.set('action', filter)
    try {
      const res = await fetch(`/api/admin/audit?${params}`, { headers: { Authorization: `Bearer ${t}` } })
      const data = await res.json()
      if (data.success) { setLogs(data.data.logs); setTotal(data.data.total) }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchLogs(1); setPage(1) }, [filter, token])

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Audit Trail</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Complete log of all user and admin actions on the platform.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-xl px-3 py-2">
          <Filter size={14} className="text-neutral-400" />
          <select value={filter} onChange={e => setFilter(e.target.value)}
            className="text-sm bg-transparent text-neutral-700 dark:text-neutral-300 focus:outline-none">
            <option value="">All actions</option>
            <option value="place.create">Place Added</option>
            <option value="place.approve">Place Approved</option>
            <option value="place.reject">Place Rejected</option>
            <option value="place.delete">Place Deleted</option>
            <option value="review.create">Review Posted</option>
            <option value="review.delete">Review Deleted</option>
            <option value="review.hide">Review Hidden</option>
          </select>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-4 flex items-center gap-3">
          <Activity size={20} className="text-primary-500" />
          <div><p className="text-xl font-bold font-serif text-neutral-900 dark:text-white">{total}</p><p className="text-xs text-neutral-500">Total Events</p></div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-4 flex items-center gap-3">
          <User size={20} className="text-primary-500" />
          <div><p className="text-xl font-bold font-serif text-neutral-900 dark:text-white">{[...new Set(logs.map(l => l.username))].length}</p><p className="text-xs text-neutral-500">Unique Users</p></div>
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-4 flex items-center gap-3">
          <Shield size={20} className="text-primary-500" />
          <div><p className="text-xl font-bold font-serif text-neutral-900 dark:text-white">{logs.filter(l => l.role === 'admin').length}</p><p className="text-xs text-neutral-500">Admin Actions</p></div>
        </div>
      </div>

      {/* Log list */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-neutral-100 dark:bg-dark-700 rounded-xl animate-pulse" />)}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center"><p className="text-neutral-400">No audit logs found.</p></div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-dark-700">
            {logs.map((log, i) => {
              const Icon = ACTION_ICONS[log.action] || Activity
              return (
                <motion.div key={log._id || i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-50 dark:hover:bg-dark-800/60 transition-colors">
                  <div className={`p-2 rounded-lg shrink-0 ${getActionColor(log.action)}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${log.role === 'admin' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'bg-neutral-100 text-neutral-600 dark:bg-dark-700 dark:text-neutral-400'}`}>
                        {log.username || 'Unknown'}
                        {log.role === 'admin' && ' (admin)'}
                      </span>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                      {log.meta?.name && <span className="text-sm font-medium text-neutral-900 dark:text-white truncate max-w-[160px]">"{log.meta.name}"</span>}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-neutral-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {total > 30 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 dark:border-dark-700">
            <p className="text-xs text-neutral-500">{total} total events</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => { setPage(p => p-1); fetchLogs(page-1) }}
                className="px-3 py-1.5 text-xs border border-neutral-200 dark:border-dark-600 rounded-lg disabled:opacity-40">← Prev</button>
              <button disabled={page * 30 >= total} onClick={() => { setPage(p => p+1); fetchLogs(page+1) }}
                className="px-3 py-1.5 text-xs border border-neutral-200 dark:border-dark-600 rounded-lg disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

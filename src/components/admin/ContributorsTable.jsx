'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { Shield, Search, RefreshCw, ChevronLeft, ChevronRight, MapPin, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export function ContributorsTable() {
  const token = useAuthStore((s) => s.token)
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage]     = useState(1)
  const [total, setTotal]   = useState(0)
  const LIMIT = 15

  const load = useCallback(async (p = 1, q = search) => {
    setLoading(true)
    const t = token || localStorage.getItem('auth_token')
    const params = new URLSearchParams({ page: p, limit: LIMIT })
    if (q) params.set('search', q)
    try {
      const res = await fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${t}` } })
      const d = await res.json()
      if (d.success) { setUsers(d.data.users || []); setTotal(d.data.total || 0) }
    } catch { toast.error('Failed to load users') }
    setLoading(false)
  }, [token, search])

  useEffect(() => { load(1, '') }, [token])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); load(1, search) }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const pages = Math.ceil(total / LIMIT)

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-neutral-100 dark:border-dark-700 flex-wrap">
        <h3 className="font-serif font-bold text-neutral-900 dark:text-white">Contributors <span className="text-neutral-400 font-sans font-normal text-sm ml-1">({total})</span></h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search username or email…"
              className="pl-8 pr-4 py-2 text-sm bg-neutral-50 dark:bg-dark-700 border border-neutral-200 dark:border-dark-600 rounded-xl focus:outline-none focus:border-primary-500 text-neutral-900 dark:text-white w-56"
            />
          </div>
          <button onClick={() => load(page)} className="p-2 rounded-xl text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-dark-700 bg-neutral-50 dark:bg-dark-900/40">
              {['User', 'Role', 'Contributions', 'Joined', 'Status'].map(h => (
                <th key={h} className="px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-dark-700">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-6 py-4">
                  <div className="h-8 bg-neutral-100 dark:bg-dark-700 rounded-xl animate-pulse" />
                </td></tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-400 text-sm">No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="hover:bg-neutral-50 dark:hover:bg-dark-800/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm shrink-0">
                      {u.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                        {u.username}
                        {u.isVerified && <Shield size={11} className="text-primary-500" />}
                      </p>
                      <p className="text-xs text-neutral-400 truncate max-w-[180px]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    u.role === 'admin'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-dark-700 dark:text-neutral-300'
                  }`}>{u.role || 'user'}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="flex items-center gap-1"><MapPin size={11} />{u.contributions?.placesAdded || 0}</span>
                    <span className="flex items-center gap-1"><MessageSquare size={11} />{u.contributions?.reviewsWritten || 0}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                    u.isVerified
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-dark-700 dark:text-neutral-400'
                  }`}>{u.isVerified ? 'Verified' : 'Unverified'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100 dark:border-dark-700">
          <p className="text-xs text-neutral-400">{total} users · page {page} of {pages}</p>
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
  )
}

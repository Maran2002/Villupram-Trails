'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { MapPin, ExternalLink, Edit2, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { PlaceImage } from '@/components/common/PlaceImage'

const STATUS_BADGE = {
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Draft:    'bg-neutral-100 text-neutral-600 dark:bg-dark-700 dark:text-neutral-400',
}

export default function AdminPlacesPage() {
  const token = useAuthStore((s) => s.token)
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const [deleting, setDeleting] = useState(null)
  const LIMIT = 15

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    const t = token || localStorage.getItem('auth_token')
    const params = new URLSearchParams({ page: p, limit: LIMIT })
    if (search) params.set('search', search)
    try {
      const res = await fetch(`/api/places?${params}`, { headers: { Authorization: `Bearer ${t}` } })
      const d = await res.json()
      if (d.success) {
        // Admin gets all statuses; filter by status client-side for simplicity
        const items = d.data?.items || []
        const filtered = status ? items.filter(pl => pl.status === status) : items
        setPlaces(filtered)
        setTotal(d.data?.total || 0)
      }
    } catch { toast.error('Failed to load places') }
    setLoading(false)
  }, [token, search, status])

  useEffect(() => { setPage(1); load(1) }, [token, status])

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(id)
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch(`/api/places/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${t}` } })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      setPlaces(prev => prev.filter(p => p._id !== id))
      toast.success('Place deleted')
    } catch (err) { toast.error(err.message || 'Delete failed') }
    setDeleting(null)
  }

  const handleApprove = async (id, action) => {
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ itemId: id, type: 'Place', action }),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      setPlaces(prev => prev.map(p => p._id === id ? { ...p, status: action === 'approve' ? 'Approved' : 'Rejected' } : p))
      toast.success(`Place ${action === 'approve' ? 'approved' : 'rejected'}`)
    } catch (err) { toast.error(err.message || 'Action failed') }
  }

  const pages = Math.ceil(total / LIMIT)

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Places</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Manage all destination listings on the platform.</p>
        </div>
        <Link href="/contribute"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
          <MapPin size={16} /> Add Place
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search places…"
            className="pl-8 pr-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 rounded-xl focus:outline-none focus:border-primary-500 text-neutral-900 dark:text-white w-56" />
        </div>
        <div className="flex gap-2">
          {['', 'Approved', 'Pending', 'Rejected', 'Draft'].map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${
                status === s
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white dark:bg-dark-800 border-neutral-200 dark:border-dark-600 text-neutral-600 dark:text-neutral-400 hover:border-primary-400'
              }`}>{s || 'All'}</button>
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
                {['Place', 'Category', 'Status', 'Rating', 'Reviews', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-dark-700">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-6 py-4">
                    <div className="h-10 bg-neutral-100 dark:bg-dark-700 rounded-xl animate-pulse" />
                  </td></tr>
                ))
              ) : places.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-neutral-400 text-sm">No places found.</td></tr>
              ) : places.map((place) => (
                <tr key={place._id} className="hover:bg-neutral-50 dark:hover:bg-dark-800/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-200 dark:bg-dark-700 shrink-0 relative">
                        {place.images?.[0] && <PlaceImage src={place.images[0]} alt={place.name} fill className="object-cover" sizes="40px" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-neutral-900 dark:text-white">{place.name}</p>
                        <p className="text-xs text-neutral-400 truncate max-w-[160px]">{place.location?.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-medium rounded-full">{place.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${STATUS_BADGE[place.status] || STATUS_BADGE.Draft}`}>{place.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">{(place.rating || 0).toFixed(1)}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{place.reviewCount || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/explore/${place._id}`} target="_blank"
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="View">
                        <ExternalLink size={14} />
                      </Link>
                      <Link
                          href={`/admin/places/${place._id}/edit`}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </Link>
                      {place.status === 'Pending' && (
                        <>
                          <button onClick={() => handleApprove(place._id, 'approve')}
                            className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Approve">
                            <Check size={14} />
                          </button>
                          <button onClick={() => handleApprove(place._id, 'reject')}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Reject">
                            <X size={14} />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleDelete(place._id, place.name)} disabled={deleting === place._id}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40" title="Delete">
                        {deleting === place._id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100 dark:border-dark-700">
            <p className="text-xs text-neutral-400">{total} places · page {page} of {pages}</p>
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
  )
}

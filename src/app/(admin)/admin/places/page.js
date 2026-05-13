'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { MapPin, ExternalLink, Edit2, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight, Check, X, Clock, AlertCircle, ArrowRight, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { PlaceImage } from '@/components/common/PlaceImage'
import { WithPermission, Perm } from '@/components/admin/WithPermission'

const STATUS_BADGE = {
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Draft:    'bg-neutral-100 text-neutral-600 dark:bg-dark-700 dark:text-neutral-400',
}

// Simple field diff row
function DiffRow({ label, oldVal, newVal }) {
  const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal)
  const fmt = (v) => Array.isArray(v) ? v.join(', ') : (v ?? '—')
  if (!changed && !oldVal) return null
  return (
    <div className={`grid grid-cols-3 gap-2 py-1.5 text-xs border-b border-neutral-100 dark:border-dark-700 last:border-0 ${changed ? 'bg-amber-50/50 dark:bg-amber-900/10 -mx-2 px-2 rounded' : ''}`}>
      <span className="font-semibold text-neutral-500 truncate">{label}</span>
      <span className="text-neutral-400 line-through truncate">{fmt(oldVal)}</span>
      <span className={`truncate ${changed ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-neutral-600 dark:text-neutral-300'}`}>{fmt(newVal)}</span>
    </div>
  )
}

// Request card for new place OR update request
function RequestCard({ item, onAction, acting }) {
  const [expanded, setExpanded] = useState(false)
  const isUpdate = item.isUpdate
  const key = item._id

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm overflow-hidden">
      <div className="flex items-center gap-4 p-5 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 dark:bg-dark-700 shrink-0">
          {item.images?.[0] && <img src={item.images[0]} alt="" className="w-full h-full object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{item.name}</p>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isUpdate ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
              {isUpdate ? 'Update Request' : 'New Submission'}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
              {item.category}
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5 truncate">{item.location?.address || 'No address'}</p>
          <p className="text-[10px] text-neutral-300 dark:text-dark-500 mt-0.5">
            Submitted {item.isUpdate ? (item.pendingUpdate?.requestedAt ? new Date(item.pendingUpdate.requestedAt).toLocaleDateString() : '—') : new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/explore/${item._id}`} target="_blank" onClick={e => e.stopPropagation()}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 transition-colors" title="Preview">
            <ExternalLink size={14} />
          </Link>
          <Perm module="approvals" action="edit">
            <button onClick={e => { e.stopPropagation(); onAction(item._id, 'approve') }} disabled={!!acting}
              className="p-2 rounded-xl bg-green-50 hover:bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 transition-colors disabled:opacity-50" title="Approve">
              {acting === key + 'approve' ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
            </button>
            <button onClick={e => { e.stopPropagation(); onAction(item._id, 'reject') }} disabled={!!acting}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50" title="Reject">
              {acting === key + 'reject' ? <RefreshCw size={13} className="animate-spin" /> : <X size={13} />}
            </button>
          </Perm>
          <button className="p-1.5 text-neutral-400">
            {expanded ? <ChevronLeft size={14} className="rotate-90" /> : <ChevronLeft size={14} className="-rotate-90" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-neutral-100 dark:border-dark-700 p-5 bg-neutral-50/50 dark:bg-dark-900/30">
          {isUpdate ? (
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <ArrowRight size={12} /> Changes Requested
                <span className="ml-2 text-[10px] font-normal normal-case text-neutral-400">Current → Proposed</span>
              </p>
              <div className="grid grid-cols-3 gap-2 py-1.5 text-[10px] font-bold text-neutral-400 uppercase border-b border-neutral-200 dark:border-dark-700 mb-1">
                <span>Field</span><span>Current</span><span>Proposed</span>
              </div>
              <DiffRow label="Name"        oldVal={item.name}                  newVal={item.pendingUpdate?.name} />
              <DiffRow label="Category"    oldVal={item.category}              newVal={item.pendingUpdate?.category} />
              <DiffRow label="Sub-Cat"     oldVal={item.subCategory}           newVal={item.pendingUpdate?.subCategory} />
              <DiffRow label="Address"     oldVal={item.location?.address}     newVal={item.pendingUpdate?.location?.address} />
              <DiffRow label="Hours"       oldVal={item.visitingHours}         newVal={item.pendingUpdate?.visitingHours} />
              <DiffRow label="Entry Fee"   oldVal={item.entryFee}              newVal={item.pendingUpdate?.entryFee} />
              <DiffRow label="Description" oldVal={item.description}           newVal={item.pendingUpdate?.description} />
              <DiffRow label="Amenities"   oldVal={item.amenities}             newVal={item.pendingUpdate?.amenities} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {item.description && (
                <div>
                  <p className="font-bold text-neutral-400 uppercase tracking-wider mb-1">Description</p>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{item.description}</p>
                </div>
              )}
              <div className="space-y-2">
                {item.visitingHours && <div><span className="font-bold text-neutral-400">Hours: </span><span className="text-neutral-600 dark:text-neutral-300">{item.visitingHours}</span></div>}
                {item.entryFee && <div><span className="font-bold text-neutral-400">Entry: </span><span className="text-neutral-600 dark:text-neutral-300">{item.entryFee}</span></div>}
                {item.amenities?.length > 0 && <div><span className="font-bold text-neutral-400">Amenities: </span><span className="text-neutral-600 dark:text-neutral-300">{item.amenities.join(', ')}</span></div>}
              </div>
              {item.images?.length > 0 && (
                <div className="md:col-span-2">
                  <p className="font-bold text-neutral-400 uppercase tracking-wider mb-2">Images ({item.images.length})</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {item.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-xl border border-neutral-200 dark:border-dark-700 shrink-0" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Requests Tab ──────────────────────────────────────────────────────────────
function RequestsTab() {
  const token = useAuthStore(s => s.token)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [filter, setFilter] = useState('all') // all | new | update

  const load = useCallback(async () => {
    setLoading(true)
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch('/api/admin/approvals', { headers: { Authorization: `Bearer ${t}` } })
      const d = await res.json()
      if (d.success) setItems(d.data.filter(i => i.type === 'Place'))
    } catch { toast.error('Failed to load requests') }
    setLoading(false)
  }, [token])

  useEffect(() => { load() }, [load])

  const handleAction = async (id, action) => {
    setActing(id + action)
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ itemId: id, type: 'Place', action }),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      setItems(prev => prev.filter(x => x._id !== id))
      toast.success(`Place ${action === 'approve' ? 'approved ✓' : 'rejected'}`)
    } catch (err) { toast.error(err.message || 'Action failed') }
    setActing(null)
  }

  const filtered = items.filter(i => filter === 'all' ? true : filter === 'update' ? i.isUpdate : !i.isUpdate)
  const newCount = items.filter(i => !i.isUpdate).length
  const updCount = items.filter(i => i.isUpdate).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white dark:bg-dark-800 p-1 rounded-xl border border-neutral-200 dark:border-dark-700">
          {[
            { id: 'all', label: `All (${items.length})` },
            { id: 'new', label: `New Submissions (${newCount})` },
            { id: 'update', label: `Update Requests (${updCount})` },
          ].map(t => (
            <button key={t.id} onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === t.id ? 'bg-primary-500 text-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={load} className="p-2 rounded-xl text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-neutral-100 dark:bg-dark-700 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700">
          <Check size={32} className="mx-auto text-green-400 mb-2" />
          <p className="text-neutral-400 text-sm">No pending {filter === 'update' ? 'update' : filter === 'new' ? 'submission' : ''} requests 🎉</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <RequestCard key={item._id} item={item} onAction={handleAction} acting={acting} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Places Table ─────────────────────────────────────────────────────────
export default function AdminPlacesPage() {
  const token = useAuthStore(s => s.token)
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleting, setDeleting] = useState(null)
  const [tab, setTab] = useState('places') // places | requests
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
        const items = d.data?.items || []
        setPlaces(status ? items.filter(pl => pl.status === status) : items)
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

  const handleToggleField = async (id, field, currentValue) => {
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch(`/api/places/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ [field]: !currentValue }),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      setPlaces(prev => prev.map(p => p._id === id ? { ...p, [field]: !currentValue } : p))
      toast.success(`${field.replace('is', '')} updated`)
    } catch (err) { toast.error(err.message || 'Update failed') }
  }

  const pages = Math.ceil(total / LIMIT)

  return (
    <WithPermission module="places" action="view">
      <div className="max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Places</h2>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">Manage destination listings and review place requests.</p>
          </div>
          <Perm module="places" action="add">
            <Link href="/contribute"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
              <MapPin size={16} /> Add Place
            </Link>
          </Perm>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-100 dark:bg-dark-800 p-1 rounded-xl w-fit border border-neutral-200 dark:border-dark-700">
          {[
            { id: 'places', label: 'All Places' },
            { id: 'requests', label: 'Requests', icon: AlertCircle },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t.id ? 'bg-white dark:bg-dark-700 text-neutral-900 dark:text-white shadow' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
              {t.icon && <t.icon size={14} className={tab === t.id ? 'text-amber-500' : ''} />}
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'requests' ? (
          <RequestsTab />
        ) : (
          <>
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search places…"
                  className="pl-8 pr-4 py-2.5 text-sm bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 rounded-xl focus:outline-none focus:border-primary-500 text-neutral-900 dark:text-white w-56" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {['', 'Approved', 'Pending', 'Rejected', 'Draft'].map(s => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors ${status === s ? 'bg-primary-500 text-white border-primary-500' : 'bg-white dark:bg-dark-800 border-neutral-200 dark:border-dark-600 text-neutral-600 dark:text-neutral-400 hover:border-primary-400'}`}>
                    {s || 'All'}
                  </button>
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
                      {['Place', 'Category', 'Status', 'Trending', 'Featured', 'Rating', 'Reviews', 'Actions'].map(h => (
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
                          <div className="flex flex-col gap-1">
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full w-fit ${STATUS_BADGE[place.status] || STATUS_BADGE.Draft}`}>{place.status}</span>
                            {place.pendingUpdate && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold rounded-full w-fit">Update Pending</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleToggleField(place._id, 'isTrending', place.isTrending)}
                            className={`p-1.5 rounded-lg transition-colors ${place.isTrending ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'text-neutral-400 hover:text-amber-400'}`} title="Toggle Trending">
                            <TrendingUp size={16} />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleToggleField(place._id, 'isFeatured', place.isFeatured)}
                            className={`p-1.5 rounded-lg transition-colors ${place.isFeatured ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'text-neutral-400 hover:text-blue-400'}`} title="Toggle Featured">
                            <Star size={16} />
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white">{(place.rating || 0).toFixed(1)}</td>
                        <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{place.reviewCount || 0}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <Link href={`/explore/${place._id}`} target="_blank"
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors" title="View">
                              <ExternalLink size={14} />
                            </Link>
                            <Perm module="places" action="edit">
                              <Link href={`/admin/places/${place._id}/edit`}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-secondary-500 hover:bg-secondary-50 dark:hover:bg-secondary-900/20 transition-colors" title="Edit">
                                <Edit2 size={14} />
                              </Link>
                            </Perm>
                            {(place.status === 'Pending' || place.pendingUpdate) && (
                              <Perm module="approvals" action="edit">
                                <button onClick={() => handleApprove(place._id, 'approve')}
                                  className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors" title="Approve">
                                  <Check size={14} />
                                </button>
                                <button onClick={() => handleApprove(place._id, 'reject')}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Reject">
                                  <X size={14} />
                                </button>
                              </Perm>
                            )}
                            <Perm module="places" action="delete">
                              <button onClick={() => handleDelete(place._id, place.name)} disabled={deleting === place._id}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40" title="Delete">
                                {deleting === place._id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              </button>
                            </Perm>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
          </>
        )}
      </div>
    </WithPermission>
  )
}

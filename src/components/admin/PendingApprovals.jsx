'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Eye, MapPin, MessageSquare, RefreshCw, ExternalLink, Info, ChevronDown, ChevronUp, Clock, Landmark, Globe, Image as ImageIcon, Sparkles, Navigation } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const STATUS_BADGE = {
  Pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const AMENITIES_MAP = {
  wheelchair: 'Wheelchair Access',
  parking: 'Parking Available',
  restrooms: 'Public Restrooms',
  photography: 'Photography Allowed',
  guided: 'Guided Tours',
}

function DiffItem({ label, oldVal, newVal, icon: Icon, isFullWidth = false }) {
  const isChanged = JSON.stringify(oldVal) !== JSON.stringify(newVal)
  
  // If no change and both are empty/null/undefined, hide the row
  const isEmpty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)
  if (!isChanged && isEmpty(oldVal)) return null

  const formatValue = (v) => {
    if (Array.isArray(v)) {
      return v.length > 0 ? v.map(a => AMENITIES_MAP[a] || a).join(', ') : 'None'
    }
    return v || '—'
  }

  return (
    <div className={`py-3 flex flex-col gap-1 border-b border-neutral-100 dark:border-dark-700 last:border-0 ${isFullWidth ? 'col-span-2' : ''}`}>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
        {Icon && <Icon size={10} />}
        {label}
        {isChanged && <span className="ml-2 px-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-[8px] rounded animate-pulse">CHANGED</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-xs text-neutral-400 line-through decoration-neutral-300 dark:decoration-neutral-600 italic">
          {formatValue(oldVal)}
        </div>
        <div className={`text-xs font-medium ${isChanged ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
          {formatValue(newVal)}
        </div>
      </div>
    </div>
  )
}

export function PendingApprovals({ compact = false }) {
  const token = useAuthStore((s) => s.token)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(null)
  const [expandedId, setExpandedId] = useState(null)

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
          {items.slice(0, limit).map((item) => {
            const isExpanded = expandedId === item._id
            return (
              <motion.div key={item._id} layout
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col"
              >
                <div className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-dark-800/60 transition-colors cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : item._id)}>
                  <div className={`p-2 rounded-lg shrink-0 ${item.type === 'Place' ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-500'}`}>
                    {item.type === 'Place' ? <MapPin size={14} /> : <MessageSquare size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                      {item.name || item.comment?.slice(0, 60) || '—'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${item.isUpdate ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : (STATUS_BADGE[item.status] || STATUS_BADGE.Pending)}`}>
                        {item.isUpdate ? 'Update Request' : item.type}
                      </span>
                      {item.submittedBy?.username && <span className="text-xs text-neutral-400">by {item.submittedBy.username}</span>}
                      <span className="text-xs text-neutral-400">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    {item.type === 'Place' && (
                      <Link href={`/explore/${item._id}`} target="_blank" onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                        <ExternalLink size={13} />
                      </Link>
                    )}
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAction(item._id, item.type, 'approve') }}
                        disabled={!!acting}
                        className="p-2 rounded-xl bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 transition-colors disabled:opacity-50"
                        title="Approve">
                        {acting === item._id + 'approve' ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAction(item._id, item.type, 'reject') }}
                        disabled={!!acting}
                        className="p-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors disabled:opacity-50"
                        title="Reject">
                        {acting === item._id + 'reject' ? <RefreshCw size={13} className="animate-spin" /> : <X size={13} />}
                      </button>
                    </div>
                    {isExpanded ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-neutral-50/50 dark:bg-dark-900/30 px-6"
                    >
                      <div className="py-6 border-t border-neutral-100 dark:border-dark-700">
                        {item.isUpdate ? (
                          <div className="space-y-6">
                            <div className="space-y-1">
                              <h4 className="text-xs font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                                <Info size={14} className="text-primary-500" />
                                Comprehensive Data Comparison
                              </h4>
                              <div className="bg-white dark:bg-dark-800 rounded-xl border border-neutral-200 dark:border-dark-700 p-4 shadow-sm">
                                <div className="grid grid-cols-2 gap-4 mb-2 pb-2 border-b border-neutral-100 dark:border-dark-700 text-[10px] font-bold text-neutral-400">
                                  <span>CURRENT LIVE VERSION</span>
                                  <span>PROPOSED UPDATE</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                                  <DiffItem label="Place Name" oldVal={item.name} newVal={item.pendingUpdate.name} icon={Landmark} isFullWidth />
                                  <DiffItem label="Category" oldVal={item.category} newVal={item.pendingUpdate.category} />
                                  <DiffItem label="Sub-Category" oldVal={item.subCategory} newVal={item.pendingUpdate.subCategory} />
                                  <DiffItem label="Latitude" oldVal={item.location?.lat} newVal={item.pendingUpdate.location?.lat} icon={Navigation} />
                                  <DiffItem label="Longitude" oldVal={item.location?.lng} newVal={item.pendingUpdate.location?.lng} icon={Navigation} />
                                  <DiffItem label="Address" oldVal={item.location?.address} newVal={item.pendingUpdate.location?.address} icon={Globe} isFullWidth />
                                  <DiffItem label="Hours" oldVal={item.visitingHours} newVal={item.pendingUpdate.visitingHours} icon={Clock} isFullWidth />
                                  <DiffItem label="Entry Fee" oldVal={item.entryFee} newVal={item.pendingUpdate.entryFee} />
                                  <DiffItem label="Amenities" oldVal={item.amenities} newVal={item.pendingUpdate.amenities} icon={Sparkles} isFullWidth />
                                  <DiffItem label="Description" oldVal={item.description} newVal={item.pendingUpdate.description} isFullWidth />
                                </div>
                              </div>
                            </div>

                            {/* Image Comparison */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <ImageIcon size={14} className="text-primary-500" />
                                Image Comparison
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase">Current Images ({item.images?.length || 0})</p>
                                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                    {item.images?.map((img, i) => (
                                      <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-neutral-200 dark:border-dark-700 shrink-0 opacity-60 grayscale-[50%]" />
                                    ))}
                                    {(!item.images || item.images.length === 0) && <p className="text-xs text-neutral-400 italic">No images</p>}
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-[10px] font-bold text-primary-500 uppercase">New Proposed Images ({item.pendingUpdate.images?.length || 0})</p>
                                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                    {item.pendingUpdate.images?.map((img, i) => (
                                      <img key={i} src={img} alt="" className="w-16 h-16 object-cover rounded-lg border border-primary-200 dark:border-primary-800 shrink-0 shadow-sm" />
                                    ))}
                                    {(!item.pendingUpdate.images || item.pendingUpdate.images.length === 0) && <p className="text-xs text-neutral-400 italic">No images</p>}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg border border-amber-100 dark:border-amber-900/30">
                              Note: This is a full data comparison. Fields that are identical are hidden to keep the review focused.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-neutral-900 dark:text-white mb-4">Submission Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Description</p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                  {item.description || item.comment || 'No description provided.'}
                                </p>
                              </div>
                              <div className="space-y-3">
                                {item.location?.address && (
                                  <div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Address</p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.location.address}</p>
                                  </div>
                                )}
                                {item.visitingHours && (
                                  <div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Visiting Hours</p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{item.visitingHours}</p>
                                  </div>
                                )}
                                {item.amenities?.length > 0 && (
                                  <div>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Amenities</p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                      {item.amenities.map(a => AMENITIES_MAP[a] || a).join(', ')}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            {item.images?.length > 0 && (
                              <div className="pt-2">
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Attached Images ({item.images.length})</p>
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                  {item.images.map((img, i) => (
                                    <img key={i} src={img} alt="" className="w-20 h-20 object-cover rounded-lg border border-neutral-200 dark:border-dark-700 shrink-0" />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

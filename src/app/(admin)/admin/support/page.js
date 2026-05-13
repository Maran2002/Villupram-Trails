'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  MessageSquare, Search, Filter, RefreshCw, 
  ChevronLeft, ChevronRight, CheckCircle2, 
  Clock, Trash2, Mail, User, Info, MoreVertical,
  ExternalLink, Check, X, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'
import { WithPermission } from '@/components/admin/WithPermission'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_CONFIG = {
  open: { 
    label: 'Open', 
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: AlertCircle
  },
  'in-progress': { 
    label: 'In Progress', 
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    icon: Clock
  },
  closed: { 
    label: 'Closed', 
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2
  }
}

export default function AdminSupportPage() {
  const token = useAuthStore((s) => s.token)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('all')
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const [updating, setUpdating] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  
  const LIMIT = 10

  const load = useCallback(async (p = 1) => {
    setLoading(true)
    const t = token || localStorage.getItem('auth_token')
    const params = new URLSearchParams({ page: p, limit: LIMIT, status, search })
    
    try {
      const res = await fetch(`/api/admin/support?${params}`, { 
        headers: { Authorization: `Bearer ${t}` } 
      })
      const d = await res.json()
      if (d.success) {
        setTickets(d.data || [])
        setTotal(d.meta?.total || 0)
      }
    } catch { 
      toast.error('Failed to load support tickets') 
    } finally {
      setLoading(false)
    }
  }, [token, search, status])

  useEffect(() => { setPage(1); load(1) }, [status])

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(1) }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdating(id)
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${t}` 
        },
        body: JSON.stringify({ id, status: newStatus }),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      setTickets(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t))
      toast.success(`Ticket marked as ${newStatus}`)
    } catch (err) { 
      toast.error(err.message || 'Update failed') 
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this ticket? This action cannot be undone.')) return
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch(`/api/admin/support?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` }
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      setTickets(prev => prev.filter(t => t._id !== id))
      toast.success('Ticket deleted')
    } catch (err) {
      toast.error(err.message || 'Delete failed')
    }
  }

  const pages = Math.ceil(total / LIMIT)

  return (
    <WithPermission module="support" action="view">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-3">
              <MessageSquare className="text-primary-500" /> Support Requests
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
              Manage inquiries from Contact and FAQ pages.
            </p>
          </div>
          <button 
            onClick={() => load(page)} 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-xl text-neutral-600 dark:text-neutral-300 hover:text-primary-500 transition-all text-sm font-medium"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by name, email, or message..."
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
            />
          </div>
          <div className="flex gap-2 p-1 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-2xl md:col-span-2">
            {['all', 'open', 'in-progress', 'closed'].map(s => (
              <button 
                key={s} 
                onClick={() => setStatus(s)}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all capitalize ${status === s ? 'bg-primary-500 text-white shadow-md' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-dark-700'}`}
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-2xl animate-pulse" />
            ))
          ) : tickets.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-3xl">
              <div className="w-16 h-16 bg-neutral-100 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="text-neutral-400" size={32} />
              </div>
              <p className="text-neutral-500 dark:text-neutral-400">No support requests found.</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const config = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
              const isExpanded = expandedId === ticket._id
              
              return (
                <div 
                  key={ticket._id} 
                  className={`bg-white dark:bg-dark-800 border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-primary-500 ring-4 ring-primary-500/5 rounded-3xl' : 'border-neutral-200 dark:border-dark-700 rounded-2xl hover:border-neutral-300 dark:hover:border-dark-600'}`}
                >
                  <div 
                    className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    onClick={() => setExpandedId(isExpanded ? null : ticket._id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}>
                        <config.icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-neutral-900 dark:text-white text-sm truncate">{ticket.name}</h3>
                          <span className="text-neutral-300 dark:text-dark-600">•</span>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{ticket.email}</p>
                        </div>
                        <p className="text-xs font-medium text-neutral-400 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-dark-900 text-[10px] text-neutral-500 uppercase tracking-wider">
                            {ticket.topic}
                          </span>
                          <span>•</span>
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                        {config.label}
                      </span>
                      <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronLeft size={18} className="-rotate-90 text-neutral-400" />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-neutral-100 dark:border-dark-700 bg-neutral-50/50 dark:bg-dark-900/30"
                      >
                        <div className="p-6 space-y-6">
                          <div>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Info size={12} /> Message Content
                            </p>
                            <div className="bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 p-4 rounded-2xl text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed shadow-sm">
                              {ticket.message}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex gap-2">
                              {['open', 'in-progress', 'closed'].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleUpdateStatus(ticket._id, s)}
                                  disabled={updating === ticket._id || ticket.status === s}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                                    ticket.status === s 
                                      ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-dark-900 dark:border-white' 
                                      : 'bg-white dark:bg-dark-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-dark-700 hover:border-primary-500 hover:text-primary-500'
                                  } disabled:opacity-50`}
                                >
                                  {updating === ticket._id ? <RefreshCw size={12} className="animate-spin" /> : (s === 'closed' ? <Check size={12} /> : (s === 'in-progress' ? <Clock size={12} /> : <AlertCircle size={12} />))}
                                  Mark as {s.replace('-', ' ')}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <a 
                                href={`mailto:${ticket.email}?subject=RE: ${ticket.topic}`}
                                className="p-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
                                title="Reply via Email"
                              >
                                <Mail size={18} />
                              </a>
                              <button 
                                onClick={() => handleDelete(ticket._id)}
                                className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/20"
                                title="Delete Ticket"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-2">
            <p className="text-xs text-neutral-400 font-medium">
              Showing <span className="text-neutral-900 dark:text-white">{tickets.length}</span> of <span className="text-neutral-900 dark:text-white">{total}</span> requests
            </p>
            <div className="flex gap-2">
              <button 
                disabled={page <= 1} 
                onClick={() => { const p = page - 1; setPage(p); load(p) }}
                className="p-2.5 rounded-xl bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 disabled:opacity-40 hover:border-primary-400 transition-all text-neutral-600 dark:text-neutral-400"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={page >= pages} 
                onClick={() => { const p = page + 1; setPage(p); load(p) }}
                className="p-2.5 rounded-xl bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 disabled:opacity-40 hover:border-primary-400 transition-all text-neutral-600 dark:text-neutral-400"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </WithPermission>
  )
}

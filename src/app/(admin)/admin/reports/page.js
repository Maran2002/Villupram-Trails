'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flag, Clock, CheckCircle2, AlertCircle, 
  ChevronDown, MessageSquare, MapPin, User,
  Filter, Search, Loader2, Info, ExternalLink,
  ShieldAlert, Send, X, Inbox, SlidersHorizontal
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import apiClient from '@/lib/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function AdminReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] = useState('all')
  
  const [updateForm, setUpdateForm] = useState({
    status: '',
    actionTaken: '',
    actionReason: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const { data } = await apiClient.get('/admin/reports')
      if (data.success) {
        setReports(data.data)
      }
    } catch (error) {
      toast.error('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    try {
      const { data } = await apiClient.patch('/admin/reports', {
        id: selectedReport._id,
        ...updateForm
      })
      if (data.success) {
        toast.success('Report updated successfully')
        fetchReports()
        setSelectedReport(null)
      }
    } catch (error) {
      toast.error('Failed to update report')
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesStatus = activeStatus === 'all' || report.status === activeStatus
      const matchesSearch = 
        report.reporterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesStatus && matchesSearch
    })
  }, [reports, activeStatus, searchQuery])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} /> Pending</span>
      case 'open': return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><AlertCircle size={12} /> Open</span>
      case 'closed': return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 size={12} /> Closed</span>
      default: return null
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>

  return (
    <div className="space-y-8 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-2">Community Reports</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Review and resolve user-submitted reports for content moderation.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex bg-white dark:bg-dark-800 p-1 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm w-full sm:w-auto">
            {['all', 'pending', 'open', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeStatus === status 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-20 text-center border border-neutral-200 dark:border-dark-700 shadow-sm">
            <div className="w-20 h-20 bg-neutral-50 dark:bg-dark-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-neutral-300">
              <Inbox size={40} />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">No Reports Found</h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto">
              We couldn't find any reports matching your current filter criteria.
            </p>
            {(activeStatus !== 'all' || searchQuery) && (
              <Button 
                variant="outline" 
                className="mt-8 rounded-xl"
                onClick={() => { setActiveStatus('all'); setSearchQuery('') }}
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          filteredReports.map((report) => (
            <motion.div 
              key={report._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-3xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-neutral-50 dark:bg-dark-900 flex items-center justify-center text-neutral-400`}>
                    <Flag size={20} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-neutral-900 dark:text-white capitalize">Report on {report.type}</h3>
                      <span className="text-[10px] text-neutral-400 bg-neutral-100 dark:bg-dark-900 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{report.reason}</span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">By <span className="font-semibold text-neutral-700 dark:text-neutral-300">{report.reporterName}</span> ({report.reporterEmail})</p>
                    <p className="text-xs text-neutral-400 italic">Submitted {format(new Date(report.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  {getStatusBadge(report.status)}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl flex items-center gap-2"
                    onClick={() => {
                      setSelectedReport(report)
                      setUpdateForm({
                        status: report.status,
                        actionTaken: report.actionTaken || '',
                        actionReason: report.actionReason || ''
                      })
                    }}
                  >
                    Take Action <ChevronDown size={14} />
                  </Button>
                </div>
              </div>

              <div className="mt-6 p-5 bg-neutral-50 dark:bg-dark-900/50 rounded-2xl border border-neutral-100 dark:border-dark-700">
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed italic">"{report.description}"</p>
                {report.targetId && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-primary-500 font-bold uppercase tracking-widest">
                    <ExternalLink size={12} /> Target ID: {report.targetId}
                  </div>
                )}
              </div>

              {report.actionTaken && (
                <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/10 px-4 py-2 rounded-xl border border-green-100 dark:border-green-900/20">
                  <CheckCircle2 size={16} /> Resolved: {report.actionTaken}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedReport(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white dark:bg-dark-800 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-neutral-100 dark:border-dark-700 flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">Moderation Action</h2>
                <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Update Status</label>
                  <select 
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                    className="w-full bg-neutral-50 dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="open">Open (Reviewing)</option>
                    <option value="closed">Closed (Resolved)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Action Taken</label>
                  <input 
                    type="text"
                    value={updateForm.actionTaken}
                    onChange={(e) => setUpdateForm({...updateForm, actionTaken: e.target.value})}
                    placeholder="e.g. Removed review, Warned user"
                    className="w-full bg-neutral-50 dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Resolution Message (Public)</label>
                  <textarea 
                    rows={4}
                    value={updateForm.actionReason}
                    onChange={(e) => setUpdateForm({...updateForm, actionReason: e.target.value})}
                    placeholder="Provide a detailed explanation for the reporter..."
                    className="w-full bg-neutral-50 dark:bg-dark-900 border border-neutral-200 dark:border-dark-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 resize-none"
                  ></textarea>
                </div>

                <Button 
                  type="submit" 
                  disabled={isUpdating}
                  className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  Apply Resolution
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

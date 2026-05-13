'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Flag, Clock, CheckCircle2, AlertCircle, 
  MessageSquare, MapPin, User,
  Loader2, Info
} from 'lucide-react'
import { Button } from '@/components/common/Button'
import apiClient from '@/lib/api'
import { format } from 'date-fns'

export default function UserReportsPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const { data } = await apiClient.get('/reports')
      if (data.success) {
        setReports(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><Clock size={12} /> Pending</span>
      case 'open': return <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><AlertCircle size={12} /> Under Review</span>
      case 'closed': return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 size={12} /> Resolved</span>
      default: return null
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'review': return <MessageSquare size={16} />
      case 'place': return <MapPin size={16} />
      case 'user': return <User size={16} />
      default: return <Flag size={16} />
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-2">My Reports</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Track the status of your integrity reports and moderation outcomes.</p>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-3xl p-12 text-center border border-neutral-200 dark:border-dark-700">
            <div className="w-16 h-16 bg-neutral-50 dark:bg-dark-900 rounded-2xl flex items-center justify-center mx-auto mb-4 text-neutral-300">
              <Flag size={32} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">No Reports Yet</h3>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-6">
              You haven't submitted any reports. Helping maintain our community standards helps everyone!
            </p>
            <Button onClick={() => window.location.href = '/report'}>Raise a Report</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reports.map((report) => (
              <motion.div 
                key={report._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-3xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-neutral-50 dark:bg-dark-900 flex items-center justify-center text-neutral-500`}>
                      {getTypeIcon(report.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white capitalize">Reported {report.type}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold">Reason: {report.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(report.status)}
                    <p className="text-xs text-neutral-400">{format(new Date(report.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                <div className="bg-neutral-50 dark:bg-dark-900/50 rounded-2xl p-4 mb-4 border border-neutral-100 dark:border-dark-700">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 italic">"{report.description}"</p>
                </div>

                {(report.actionTaken || report.actionReason) && (
                  <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 p-5 rounded-2xl">
                    <div className="flex gap-3">
                      <Info className="text-primary-500 shrink-0" size={18} />
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-primary-700 dark:text-primary-400">Moderator Resolution:</p>
                        {report.actionTaken && <p className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">Action: <span className="text-primary-600 dark:text-primary-400">{report.actionTaken}</span></p>}
                        {report.actionReason && <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{report.actionReason}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

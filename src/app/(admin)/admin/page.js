'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, MapPin, CheckCircle, MessageSquare, TrendingUp, ArrowUpRight, Clock, Eye, Activity, Shield } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { PendingApprovals } from '@/components/admin/PendingApprovals'
import Link from 'next/link'

const ACTION_LABELS = {
  'place.create': 'added a place', 'place.edit': 'edited a place',
  'place.admin_edit': 'admin-edited a place', 'place.delete': 'deleted a place',
  'place.approve': 'approved a place', 'place.reject': 'rejected a place',
  'review.create': 'posted a review', 'review.delete': 'deleted a review',
  'review.hide': 'hid a review', 'review.show': 'restored a review',
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.08 } }),
}

function StatCard({ label, value, icon: Icon, sub, color = 'primary', href, idx }) {
  const colors = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-500',
    green:   'bg-green-50 dark:bg-green-900/20 text-green-500',
    amber:   'bg-amber-50 dark:bg-amber-900/20 text-amber-500',
    blue:    'bg-blue-50 dark:bg-blue-900/20 text-blue-500',
  }
  const card = (
    <motion.div custom={idx} variants={fadeUp} initial="hidden" animate="show"
      className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-neutral-200 dark:border-dark-700 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}><Icon size={20} /></div>
        <ArrowUpRight size={16} className="text-neutral-300 dark:text-dark-600 group-hover:text-primary-500 transition-colors" />
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-1">{label}</p>
      {value === null
        ? <div className="h-8 w-20 bg-neutral-100 dark:bg-dark-700 rounded-lg animate-pulse" />
        : <p className="text-3xl font-bold text-neutral-900 dark:text-white font-serif">{value?.toLocaleString()}</p>
      }
      {sub && <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">{sub}</p>}
    </motion.div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}

export default function AdminOverviewPage() {
  const token = useAuthStore((s) => s.token)
  const user  = useAuthStore((s) => s.user)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const t = token || localStorage.getItem('auth_token')
    fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data) })
      .catch(() => {})
  }, [token])

  const s = stats

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome */}
      <div>
        <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-1">
          Welcome back{user?.username ? `, ${user.username}` : ''}.
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Here is a live overview of the platform's health and activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard idx={0} label="Total Users"       value={s?.totalUsers ?? null}       icon={Users}        color="primary" sub={s ? `+${s.recentUsers} this month` : ''} href="/admin/contributors" />
        <StatCard idx={1} label="Approved Places"   value={s?.totalPlaces ?? null}      icon={MapPin}        color="blue"    sub={s ? `+${s.recentPlaces} this week` : ''}  href="/admin/places" />
        <StatCard idx={2} label="Pending Approvals" value={s?.pendingApprovals ?? null} icon={CheckCircle}   color="amber"   sub="Needs attention"                          href="/admin/approvals" />
        <StatCard idx={3} label="Total Reviews"     value={s?.totalReviews ?? null}     icon={MessageSquare} color="green"   sub={s?.hiddenReviews ? `${s.hiddenReviews} hidden` : 'All visible'} />
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PendingApprovals compact />
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <Activity size={18} className="text-primary-500" />
            <h3 className="font-serif font-bold text-neutral-900 dark:text-white">Recent Activity</h3>
          </div>
          {!s ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-neutral-100 dark:bg-dark-700 rounded-xl animate-pulse" />)}</div>
          ) : s.recentActivity?.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">No activity yet.</p>
          ) : (
            <div className="space-y-3 flex-1">
              {s.recentActivity?.map((log, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg shrink-0 ${log.role === 'admin' ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'bg-neutral-100 dark:bg-dark-700 text-neutral-500'}`}>
                    {log.role === 'admin' ? <Shield size={12} /> : <Users size={12} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-snug">
                      <span className="font-semibold">{log.username}</span>{' '}
                      {ACTION_LABELS[log.action] || log.action}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              <Link href="/admin/audit"
                className="block text-center text-xs text-primary-500 hover:underline pt-2">
                View full audit trail →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

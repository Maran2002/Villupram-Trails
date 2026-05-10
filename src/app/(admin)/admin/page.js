'use client'

import { motion } from 'framer-motion'
import { Users, MapPin, CheckCircle, Flag, TrendingUp, ArrowUpRight } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { PendingApprovals } from '@/components/admin/PendingApprovals'
import { ContributorsTable } from '@/components/admin/ContributorsTable'

const stats = [
  { label: 'Total Users',       value: '1,248', icon: <Users size={20} />,       trend: '+14 this month' },
  { label: 'Total Places',      value: '342',   icon: <MapPin size={20} />,       trend: '+8 this week' },
  { label: 'Pending Approvals', value: '12',    icon: <CheckCircle size={20} />,  trend: 'Needs attention' },
  { label: 'Reported Items',    value: '3',     icon: <Flag size={20} />,         trend: 'Requires review' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.35, delay: i * 0.08 } }),
}

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8 max-w-7xl">
      {/* Welcome */}
      <div>
        <h2 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-1">
          Welcome Back.
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">
          Here is an overview of the platform's current health and activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
          >
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-5 border border-neutral-200 dark:border-dark-700 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-primary-50 dark:bg-primary-900/20 text-primary-500 rounded-xl">
                  {stat.icon}
                </div>
                <ArrowUpRight size={16} className="text-neutral-300 dark:text-dark-600 group-hover:text-primary-500 transition-colors" />
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-neutral-900 dark:text-white font-serif">{stat.value}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-2">{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Two Column */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <PendingApprovals />
        </div>
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-primary-500" />
            <h3 className="font-serif font-bold text-neutral-900 dark:text-white">Activity</h3>
          </div>
          <div className="flex-1 flex items-center justify-center text-neutral-400 dark:text-neutral-600 text-sm">
            Activity chart coming soon
          </div>
        </div>
      </div>

      {/* Contributors */}
      <ContributorsTable />
    </div>
  )
}

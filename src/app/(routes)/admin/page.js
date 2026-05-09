'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { ContributorsTable } from '@/components/admin/ContributorsTable'
import { PendingApprovals } from '@/components/admin/PendingApprovals'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Users, Map, Activity, Flag } from 'lucide-react'

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const overallStats = [
    { label: 'Total Users', value: '1,248', icon: <Users /> },
    { label: 'Total Places', value: '342', icon: <Map /> },
    { label: 'Pending Approvals', value: '12', icon: <Activity /> },
    { label: 'Reported Items', value: '3', icon: <Flag /> },
  ]

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-950 flex flex-col lg:flex-row">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Manage community content, contributors, and platform health.
              </p>
            </div>
          </div>

          {/* Tab Content Routing */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {overallStats.map((stat, i) => (
                    <StatsCard key={i} label={stat.label} value={stat.value} icon={stat.icon} />
                  ))}
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                  <PendingApprovals />
                  <div className="bg-white dark:bg-dark-900 rounded-2xl border border-neutral-200 dark:border-dark-700 p-6 flex items-center justify-center min-h-[300px]">
                    <p className="text-neutral-500">Activity Chart Placeholder</p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'contributors' && (
              <ContributorsTable />
            )}

            {activeTab === 'approvals' && (
              <PendingApprovals />
            )}

            {activeTab === 'reports' && (
              <div className="bg-white dark:bg-dark-900 rounded-2xl border border-neutral-200 dark:border-dark-700 p-6">
                <h3 className="font-serif font-bold text-xl mb-4">Reported Content</h3>
                <p className="text-neutral-500 text-center py-8">No reported content to review.</p>
              </div>
            )}
            
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-dark-900 rounded-2xl border border-neutral-200 dark:border-dark-700 p-6">
                <h3 className="font-serif font-bold text-xl mb-4">Platform Settings</h3>
                <p className="text-neutral-500">Configure global platform guidelines, points system, and categories here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

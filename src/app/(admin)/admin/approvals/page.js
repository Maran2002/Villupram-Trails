'use client'

import { PendingApprovals } from '@/components/admin/PendingApprovals'

export default function AdminApprovalsPage() {
  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Pending Approvals</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Review and approve or reject community-submitted content.</p>
      </div>
      <PendingApprovals />
    </div>
  )
}

'use client'

import { PendingApprovals } from '@/components/admin/PendingApprovals'
import { WithPermission } from '@/components/admin/WithPermission'

export default function AdminApprovalsPage() {
  return (
    <WithPermission module="approvals" action="view">
      <div className="max-w-4xl space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Pending Approvals</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Review and approve or reject community-submitted places and reported reviews.</p>
        </div>
        <PendingApprovals />
      </div>
    </WithPermission>
  )
}

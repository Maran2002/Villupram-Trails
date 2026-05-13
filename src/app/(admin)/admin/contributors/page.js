'use client'

import { ContributorsTable } from '@/components/admin/ContributorsTable'
import { WithPermission } from '@/components/admin/WithPermission'

export default function AdminContributorsPage() {
  return (
    <WithPermission module="contributors" action="view">
      <div className="max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Contributors</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Manage all registered users, their roles, and contribution records.</p>
        </div>
        <ContributorsTable />
      </div>
    </WithPermission>
  )
}

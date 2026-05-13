'use client'

import { WithPermission } from '@/components/admin/WithPermission'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'

export default function AdminUsersPage() {
  return (
    <WithPermission module="users" action="view">
      <div className="max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Admins & Users</h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Manage system administrators, permissions, and user accounts.</p>
        </div>
        <AdminUsersTable />
      </div>
    </WithPermission>
  )
}

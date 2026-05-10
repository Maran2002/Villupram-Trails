'use client'

import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Shield, ShieldOff, MoreVertical } from 'lucide-react'

export function ContributorsTable() {
  const contributors = [
    { id: 1, username: 'johndoe', email: 'john@example.com', placesAdded: 12, reviews: 45, status: 'Active', isVerified: true },
    { id: 2, username: 'traveler99', email: 'traveler99@example.com', placesAdded: 3, reviews: 8, status: 'Active', isVerified: false },
    { id: 3, username: 'spammer123', email: 'spam@example.com', placesAdded: 0, reviews: 0, status: 'Suspended', isVerified: false },
  ]

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-serif font-bold text-xl text-neutral-900 dark:text-white">Contributor Directory</h3>
        <Button variant="outline" size="sm">Export CSV</Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-dark-700 text-sm text-neutral-500 dark:text-neutral-400">
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Contributions</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contributors.map((user) => (
              <tr key={user.id} className="border-b border-neutral-100 dark:border-dark-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-dark-800/50 transition">
                <td className="py-4">
                  <div>
                    <div className="font-medium flex items-center gap-2 text-neutral-900 dark:text-neutral-50">
                      {user.username}
                      {user.isVerified && <Shield size={14} className="text-primary-500" />}
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</div>
                  </div>
                </td>
                <td className="py-4">
                  <div className="text-sm text-neutral-900 dark:text-neutral-50">
                    <div><span className="font-medium">{user.placesAdded}</span> Places</div>
                    <div className="text-neutral-500 dark:text-neutral-400"><span className="font-medium">{user.reviews}</span> Reviews</div>
                  </div>
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-sm">View Profile</Button>
                    <button className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

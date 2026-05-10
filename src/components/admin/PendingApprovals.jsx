'use client'

import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Check, X, Eye } from 'lucide-react'

export function PendingApprovals() {
  const pendingPlaces = [
    { id: 1, name: 'Secret Waterfall', submittedBy: 'traveler99', date: '2026-05-08', type: 'Place' },
    { id: 2, name: 'Ancient Temple Review', submittedBy: 'historyBuff', date: '2026-05-09', type: 'Review' },
  ]

  return (
    <Card className="p-6">
      <h3 className="font-serif font-bold text-xl mb-4 text-neutral-900 dark:text-white">Pending Approvals</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-dark-700 text-sm text-neutral-500 dark:text-neutral-400">
              <th className="pb-3 font-medium">Content Name</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Submitted By</th>
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingPlaces.map((item) => (
              <tr key={item.id} className="border-b border-neutral-100 dark:border-dark-800 last:border-0 hover:bg-neutral-50 dark:hover:bg-dark-800/50 transition">
                <td className="py-4 font-medium text-neutral-900 dark:text-neutral-50">{item.name}</td>
                <td className="py-4">
                  <span className="px-2 py-1 bg-neutral-100 dark:bg-dark-700 text-neutral-700 dark:text-neutral-300 rounded text-xs">{item.type}</span>
                </td>
                <td className="py-4 text-neutral-600 dark:text-neutral-400">{item.submittedBy}</td>
                <td className="py-4 text-neutral-600 dark:text-neutral-400">{item.date}</td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="p-2 text-primary-500 hover:bg-primary-500/10"><Eye size={16} /></Button>
                    <Button variant="outline" size="sm" className="p-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-500/10"><Check size={16} /></Button>
                    <Button variant="outline" size="sm" className="p-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"><X size={16} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pendingPlaces.length === 0 && (
          <p className="text-center text-neutral-500 py-8">No pending approvals.</p>
        )}
      </div>
    </Card>
  )
}

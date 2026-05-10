'use client'

import { AlertTriangle } from 'lucide-react'

const mockReports = [
  { id: 1, type: 'Review', content: 'Spam review on "Gingee Fort"', reporter: 'user123', date: '2026-05-09', status: 'Open' },
  { id: 2, type: 'Place',  content: 'Incorrect information on "Ulundurpet Market"', reporter: 'local_guide', date: '2026-05-08', status: 'Open' },
  { id: 3, type: 'Review', content: 'Offensive language in review', reporter: 'traveler99', date: '2026-05-07', status: 'Resolved' },
]

export default function AdminReportsPage() {
  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Reported Content</h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">Review flagged content submitted by community members.</p>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-dark-700 bg-neutral-50 dark:bg-dark-900/50">
                {['Type', 'Content', 'Reported By', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-dark-700">
              {mockReports.map(report => (
                <tr key={report.id} className="hover:bg-neutral-50 dark:hover:bg-dark-800/60 transition-colors">
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full w-fit">
                      <AlertTriangle size={11} /> {report.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100 max-w-xs truncate">{report.content}</td>
                  <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{report.reporter}</td>
                  <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">{report.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      report.status === 'Open'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    }`}>{report.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

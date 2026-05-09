'use client'

import { useState } from 'react'
import { Users, MapPin, CheckCircle, AlertTriangle, Settings, BarChart2 } from 'lucide-react'

export function AdminSidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={20} /> },
    { id: 'contributors', label: 'Contributors', icon: <Users size={20} /> },
    { id: 'approvals', label: 'Pending Approvals', icon: <CheckCircle size={20} /> },
    { id: 'reports', label: 'Reported Content', icon: <AlertTriangle size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ]

  return (
    <aside className="w-full lg:w-64 bg-white dark:bg-dark-900 border-r border-neutral-200 dark:border-dark-700 p-6 flex flex-col gap-2 rounded-xl lg:rounded-none lg:min-h-[calc(100vh-4rem)]">
      <h2 className="font-serif font-bold text-xl mb-6 text-neutral-900 dark:text-white px-2">Admin Panel</h2>
      <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 font-medium'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-dark-800'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}

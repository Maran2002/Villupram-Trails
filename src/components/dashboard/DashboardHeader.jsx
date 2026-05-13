'use client'

import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, LogOut, Bell, User, LayoutDashboard, Settings, Flag } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardHeader() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.push('/')
  }

  const handleNotifications = () => {
    toast('Notifications will be updated soon!', {
      icon: '🔔',
      style: {
        borderRadius: '12px',
        background: '#333',
        color: '#fff',
      },
    })
  }

  return (
    <header className="h-16 bg-white dark:bg-dark-800 border-b border-neutral-200 dark:border-dark-700 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <MapPin size={18} />
          </div>
          <span className="font-serif font-bold text-lg text-neutral-900 dark:text-white hidden sm:block">
            Villupuram <span className="italic font-light">Hub</span>
          </span>
        </Link>
        <div className="h-6 w-px bg-neutral-200 dark:bg-dark-700 mx-2 hidden sm:block" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary-500">Dashboard</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
           <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-lg flex items-center gap-2">
            <LayoutDashboard size={16} />
            Overview
          </Link>
          <Link href="/dashboard/reports" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-lg flex items-center gap-2">
            <Flag size={16} />
            My Reports
          </Link>
          <Link href="/dashboard/profile" className="px-3 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-lg flex items-center gap-2">
            <Settings size={16} />
            Profile Settings
          </Link>
        </nav>

        <div className="h-8 w-px bg-neutral-200 dark:bg-dark-700 hidden sm:block" />

        <button 
          onClick={handleNotifications}
          className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-full transition relative"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        <Link href="/dashboard/profile" className="flex items-center gap-3 group">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-bold text-neutral-900 dark:text-white leading-tight group-hover:text-primary-500 transition-colors">{user?.username}</span>
            <span className="text-[10px] uppercase tracking-tighter text-neutral-500">{user?.role}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-dark-700 flex items-center justify-center border border-neutral-200 dark:border-dark-600 overflow-hidden ring-0 group-hover:ring-2 ring-primary-500/30 transition-all">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <User size={18} className="text-neutral-500" />
            )}
          </div>
        </Link>

        <button 
          onClick={handleLogout}
          className="p-2 text-neutral-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}

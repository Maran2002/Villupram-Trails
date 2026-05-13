'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, MapPin, CheckCircle,
  Flag, Settings, ChevronLeft, Menu, X,
  Bell, LogOut, Shield, Activity, MessageSquare,
  BarChart2, User, Power
} from 'lucide-react'
import { useAuthStore, useSettingsStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { AdminSearch } from '@/components/admin/AdminSearch'

const navItems = [
  { id: 'overview',      label: 'Overview',         href: '/admin',                icon: LayoutDashboard },
  { id: 'visitor-logs',  label: 'Visitor Logs',      href: '/admin/logs',           icon: BarChart2 },
  { id: 'places',        label: 'Places',            href: '/admin/places',         icon: MapPin },
  { id: 'reviews',       label: 'Reviews',           href: '/admin/reviews',        icon: MessageSquare },
  { id: 'contributors',  label: 'Contributors',      href: '/admin/contributors',   icon: Users },
  { id: 'approvals',     label: 'Pending Approvals', href: '/admin/approvals',      icon: CheckCircle },
  { id: 'audit',         label: 'Audit Trail',       href: '/admin/audit',          icon: Activity },
  { id: 'reports',       label: 'Reports',           href: '/admin/reports',        icon: Flag },
  { id: 'profile',       label: 'My Profile',        href: '/admin/profile',        icon: User },
  { id: 'settings',      label: 'Settings',          href: '/admin/settings',       icon: Settings },
]

function AdminSidebarNav({ collapsed, setCollapsed }) {
  const pathname = usePathname()
  const { settings } = useSettingsStore()

  return (
    <aside className={`h-screen sticky top-0 flex flex-col bg-neutral-900 text-white transition-all duration-300 ${collapsed ? 'w-[72px]' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center shrink-0 shadow-lg overflow-hidden">
          {settings.siteLogo ? <img src={settings.siteLogo} alt="" className="w-full h-full object-cover" /> : <Shield size={18} className="text-white" strokeWidth={2.5} />}
        </div>
        {!collapsed && (
          <div>
            <p className="font-serif font-bold text-sm leading-tight">Admin Panel</p>
            <p className="text-[10px] text-neutral-400 leading-tight truncate max-w-[140px]">{settings.siteName || 'Villupuram Hub'}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto space-y-1 px-2">
        {navItems.map(({ id, label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link key={id} href={href} title={collapsed ? label : undefined} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
              {!collapsed && isActive && <motion.div layoutId="activeAdminIndicator" className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/10 p-3 space-y-1">
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-white transition-all text-sm font-medium" title={collapsed ? 'Back to Site' : undefined}>
          <LogOut size={18} className="shrink-0" />
          {!collapsed && 'Back to Site'}
        </Link>
        <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-400 hover:bg-white/5 hover:text-white transition-all text-sm font-medium" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          <ChevronLeft size={18} className={`shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && 'Collapse'}
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const activeItem = navItems.find(item => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) || navItems[0]

  const handleNotifications = () => {
    toast('Notifications will be updated soon!', {
      icon: '🔔',
      style: { borderRadius: '12px', background: '#333', color: '#fff' },
    })
  }

  const handleLogout = async () => {
    const loadingToast = toast.loading('Signing out...')
    try {
      await logout()
      toast.success('Signed out safely', { id: loadingToast })
      router.push('/auth/login')
    } catch (error) {
      toast.error('Failed to sign out', { id: loadingToast })
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100 dark:bg-dark-900">
      <div className="hidden lg:flex">
        <AdminSidebarNav collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 220 }} className="fixed inset-y-0 left-0 z-50 lg:hidden">
              <AdminSidebarNav collapsed={false} setCollapsed={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-dark-800 border-b border-neutral-200 dark:border-dark-700 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-700 transition" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
            <h1 className="hidden sm:block font-serif font-bold text-lg text-neutral-900 dark:text-white capitalize">{activeItem.label}</h1>
          </div>

          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <AdminSearch />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleNotifications} className="relative p-2 rounded-xl bg-neutral-100 dark:bg-dark-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-dark-600 transition">
              <Bell size={18} /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500" />
            </button>
            
            <div className="h-8 w-px bg-neutral-200 dark:bg-dark-700 mx-1 hidden sm:block"></div>
            
            <Link href="/admin/profile" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold shadow overflow-hidden ring-0 group-hover:ring-2 ring-primary-500/30 transition-all">
                {user?.profileImage ? <img src={user.profileImage} alt={user.username} className="w-full h-full object-cover" /> : user?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
            </Link>

            <button 
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/20"
            >
              <Power size={18} />
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>{children}</motion.div>
        </main>
      </div>
    </div>
  )
}

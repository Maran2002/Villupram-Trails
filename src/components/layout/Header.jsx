'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu, X, MapPin, ChevronDown, LayoutDashboard, LogOut, User, Flag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore, useSettingsStore } from '@/lib/store'

export function Header() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const { settings } = useSettingsStore()

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const handler = () => setUserMenuOpen(false)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [userMenuOpen])

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'About', path: '/about' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Guidelines', path: '/guidelines' },
    { name: 'Contact', path: '/contact' },
  ]

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  const isTransparent = !isScrolled
  const navTextBase = isTransparent ? 'text-neutral-700 dark:text-neutral-200' : 'text-neutral-600 dark:text-neutral-300'

  const truncateName = (name) => name && name.length > 8 ? name.slice(0, 8) + '…' : name

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl border-b border-neutral-200/50 dark:border-dark-700/50 shadow-sm'
          : ' border-neutral-200/30 dark:border-dark-800/30'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
              {settings.siteLogo ? (
                <img src={settings.siteLogo} alt="" className="w-full h-full object-cover" />
              ) : (
                <MapPin size={22} strokeWidth={2.5} />
              )}
            </div>
            <span className="font-serif text-2xl font-bold text-primary-600 dark:text-primary-400 transition-colors">
              {settings.siteName || 'Villupuram'} <span className="text-neutral-800 dark:text-white font-light italic">Hub</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.path
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`relative font-medium text-sm transition-colors ${
                    isActive
                      ? 'text-primary-500'
                      : `${navTextBase} hover:text-primary-500`
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-neutral-700 dark:text-neutral-300 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {mounted ? (resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />) : <div className="w-[18px] h-[18px]" />}
            </button>

            {user ? (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/20 dark:hover:bg-primary-900/40 border border-primary-200 dark:border-primary-800/50 text-primary-700 dark:text-primary-300 text-sm font-semibold transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden">
                    {user.profileImage ? <img src={user.profileImage} alt="" className="w-full h-full object-cover" /> : <User size={13} className="text-white" />}
                  </div>
                  {truncateName(user.username)}
                  <ChevronDown size={14} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-lg overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-neutral-100 dark:border-dark-700">
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">Signed in as</p>
                        <p className="font-semibold text-sm text-neutral-900 dark:text-white truncate">{user.username}</p>
                      </div>
                      <Link
                        href={user.role === 'admin' ? '/admin' : '/dashboard'}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <LayoutDashboard size={15} /> {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                      </Link>
                      <Link
                        href="/report"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Flag size={15} /> Raise a Report
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full border-t border-neutral-100 dark:border-dark-700 flex items-center gap-2.5 px-4 py-3 text-sm text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-dark-700 transition-colors"
                      >
                        <LogOut size={15} /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="px-4 py-2 text-sm font-semibold rounded-xl border border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">Sign In</Link>
                <Link href="/auth/register" className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20 transition-all">Join Community</Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full bg-neutral-100 dark:bg-dark-800 text-neutral-700 dark:text-neutral-300">
              {mounted ? (resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />) : <div className="w-[18px] h-[18px]" />}
            </button>
            <button className="p-2 -mr-2 text-neutral-800 dark:text-neutral-200" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-dark-900 border-b border-neutral-200 dark:border-dark-700 shadow-xl overflow-hidden"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.path} className={`text-lg font-medium p-3 rounded-xl transition-colors ${pathname === link.path ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-800'}`} onClick={() => setMobileMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-neutral-100 dark:bg-dark-800 my-2" />
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2"><p className="text-xs text-neutral-400">Signed in as <span className="font-semibold text-neutral-700 dark:text-neutral-300">{user.username}</span></p></div>
                  <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    <LayoutDashboard size={16} /> {user.role === 'admin' ? 'Admin Panel' : 'My Dashboard'}
                  </Link>
                  <Link href="/report" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Flag size={16} /> Raise a Report
                  </Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false) }} className="w-full flex items-center gap-2 p-3 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-dark-800 transition-colors">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 rounded-xl border border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 text-sm font-semibold">Sign In</Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)} className="text-center py-2.5 rounded-xl bg-primary-500 text-white text-sm font-semibold">Join Us</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

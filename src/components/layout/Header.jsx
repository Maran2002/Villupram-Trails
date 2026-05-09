'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Moon, Sun, Menu, X, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/common/Button'

export function Header() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Wait until mounted to render theme toggle to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'About', path: '/about' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Guidelines', path: '/guidelines' },
  ]

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-dark-700/50 shadow-sm' 
          : 'bg-transparent border-b border-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform duration-300">
              <MapPin size={22} strokeWidth={2.5} />
            </div>
            <span className={`font-serif text-2xl font-bold transition-colors ${isScrolled ? 'text-neutral-900 dark:text-white' : 'text-white drop-shadow-md lg:text-neutral-900 lg:dark:text-white'}`}>
              Villupuram <span className="text-primary-500 font-light italic">Hub</span>
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
                  className={`relative font-medium text-sm transition-colors hover:text-primary-500 ${
                    isActive 
                      ? 'text-primary-500' 
                      : isScrolled ? 'text-neutral-600 dark:text-neutral-300' : 'text-neutral-200 lg:text-neutral-600 lg:dark:text-neutral-300 drop-shadow-sm lg:drop-shadow-none'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-500 rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                isScrolled 
                  ? 'bg-neutral-100 hover:bg-neutral-200 dark:bg-dark-800 dark:hover:bg-dark-700 text-neutral-700 dark:text-neutral-300' 
                  : 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md lg:bg-neutral-100 lg:dark:bg-dark-800 lg:text-neutral-700 lg:dark:text-neutral-300'
              }`}
              aria-label="Toggle theme"
            >
              {mounted ? (
                theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />
              ) : (
                <div className="w-[18px] h-[18px]"></div>
              )}
            </button>
            <Link href="/auth/login">
              <Button size="sm" variant="outline" className={`border-neutral-200 dark:border-dark-700 ${!isScrolled && 'border-white/30 text-white hover:bg-white/10 lg:border-neutral-200 lg:text-neutral-900 lg:dark:text-white'}`}>
                Sign In
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button size="sm" className="shadow-lg shadow-primary-500/20">
                Join Community
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full ${isScrolled ? 'text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-dark-800' : 'text-white bg-white/20'}`}
            >
              {mounted ? (theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />) : <div className="w-[18px] h-[18px]"></div>}
            </button>
            <button 
              className={`p-2 -mr-2 ${isScrolled ? 'text-neutral-900 dark:text-white' : 'text-white'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-dark-900 border-b border-neutral-200 dark:border-dark-700 shadow-xl overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.path} 
                  className={`text-lg font-medium p-3 rounded-xl transition-colors ${
                    pathname === link.path 
                      ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400' 
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-neutral-100 dark:bg-dark-800 my-2"></div>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">Sign In</Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center">Join Us</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

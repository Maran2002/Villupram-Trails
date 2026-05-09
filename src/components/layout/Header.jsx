'use client'

import Link from 'next/link'
import { useThemeStore } from '@/lib/store/themeStore'
import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'

export function Header() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <motion.header
      className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-dark-800/90 border-b border-neutral-200 dark:border-dark-700"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="font-serif text-2xl font-bold text-primary-400">
            Villupuram Trails
          </Link>

          <nav className="hidden md:flex gap-8">
            <Link href="/explore" className="hover:text-primary-400 transition">Explore</Link>
            <Link href="/about" className="hover:text-primary-400 transition">About</Link>
            <Link href="/faq" className="hover:text-primary-400 transition">FAQ</Link>
          </nav>

          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-dark-700 rounded-lg transition"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </motion.header>
  )
}

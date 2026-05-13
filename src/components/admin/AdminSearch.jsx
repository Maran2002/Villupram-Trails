'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Loader2, MapPin, User, ArrowRight, X, MessageSquare, Layout } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '@/lib/api'

export function AdminSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const searchRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch()
      } else {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const { data } = await apiClient.get(`/admin/search?q=${encodeURIComponent(query)}`)
      if (data.success) {
        setResults(data.data)
        setIsOpen(true)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (href) => {
    router.push(href)
    setIsOpen(false)
    setQuery('')
  }

  const getIcon = (type) => {
    switch (type) {
      case 'place': return <MapPin size={18} />
      case 'user': return <User size={18} />
      case 'review': return <MessageSquare size={18} />
      case 'page': return <Layout size={18} />
      default: return <Search size={18} />
    }
  }

  const getColors = (type) => {
    switch (type) {
      case 'place': return 'bg-blue-50 text-blue-500 dark:bg-blue-500/10'
      case 'user': return 'bg-purple-50 text-purple-500 dark:bg-purple-500/10'
      case 'review': return 'bg-amber-50 text-amber-500 dark:bg-amber-500/10'
      case 'page': return 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10'
      default: return 'bg-neutral-50 text-neutral-500 dark:bg-dark-700'
    }
  }

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 size={15} className="text-primary-500 animate-spin" />
          ) : (
            <Search size={15} className="text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Search menu, places, users or reviews..."
          className="w-full bg-neutral-100 dark:bg-dark-700 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-dark-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-neutral-900 dark:text-white transition-all outline-none focus:ring-1 focus:ring-primary-500/20 shadow-inner"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-2xl shadow-xl overflow-hidden z-50 max-h-[450px] overflow-y-auto"
          >
            <div className="p-2">
              {results.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.href)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-dark-700/50 transition-colors group text-left"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getColors(item.type)}`}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">{item.title}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate uppercase tracking-wider">{item.subtitle}</p>
                  </div>
                  <ArrowRight size={14} className="text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
        {isOpen && query.length >= 2 && results.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-2xl shadow-xl p-8 text-center z-50"
          >
            <p className="text-sm text-neutral-500 dark:text-neutral-400">No results found for "{query}"</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

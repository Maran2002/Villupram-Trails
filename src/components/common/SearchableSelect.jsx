'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option...", 
  label = "",
  error = ""
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">
          {label}
        </label>
      )}
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-neutral-50 dark:bg-dark-900 border ${
          isOpen ? 'border-primary-500 ring-2 ring-primary-500/10' : 'border-neutral-200 dark:border-dark-700'
        } rounded-2xl px-5 py-4 flex items-center justify-between cursor-pointer transition-all hover:border-primary-500/50 group`}
      >
        <span className={`${selectedOption ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'} text-sm font-medium`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={18} 
          className={`text-neutral-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-700 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-neutral-100 dark:border-dark-700 relative">
              <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input 
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-dark-900 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-0 text-neutral-900 dark:text-white"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div className="max-h-[250px] overflow-y-auto p-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value)
                      setIsOpen(false)
                      setSearch('')
                    }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors ${
                      value === opt.value 
                        ? 'bg-primary-500 text-white' 
                        : 'hover:bg-neutral-50 dark:hover:bg-dark-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                    {value === opt.value && <Check size={16} />}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-neutral-400 text-sm italic">
                  No matches found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{error}</p>}
    </div>
  )
}

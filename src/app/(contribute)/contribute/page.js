'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  MapPin, ChevronDown, CloudUpload, X, Clock, DollarSign,
  Check, Landmark, FileText, Image as ImageIcon, Save, Send, AlertCircle, RefreshCw, ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'
import { compressToBase64 } from '@/lib/imageUtils'
import { reverseGeocode, getEmbedMapUrl } from '@/lib/maps'

const CATEGORIES = ['Heritage', 'Nature', 'Temple', 'Food', 'Beach', 'Adventure', 'Other']
const SUB_CATEGORIES = ['Fortress', 'Palace', 'Waterfall', 'Wildlife', 'Religious', 'Dam', 'Museum', 'Other']
const AMENITIES = [
  { id: 'wheelchair', label: 'Wheelchair Access' },
  { id: 'parking', label: 'Parking Available' },
  { id: 'restrooms', label: 'Public Restrooms' },
  { id: 'photography', label: 'Photography Allowed' },
  { id: 'guided', label: 'Guided Tours' },
]
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Generate time options: 12:00 AM … 11:30 PM in 30-min steps
const TIME_OPTIONS = (() => {
  const opts = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const ampm = h < 12 ? 'AM' : 'PM'
      const h12 = h % 12 === 0 ? 12 : h % 12
      const label = `${h12}:${m === 0 ? '00' : '30'} ${ampm}`
      opts.push(label)
    }
  }
  return opts
})()

const inputCls = 'w-full rounded-xl border border-neutral-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-neutral-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all placeholder:text-neutral-400'

/* ── Shared label ─────────────────────────────────────────── */
function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wide">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

/* ── Section card ─────────────────────────────────────────── */
function SectionCard({ number, title, icon: Icon, children }) {
  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm overflow-visible">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100 dark:border-dark-700 bg-neutral-50/60 dark:bg-dark-900/40">
        <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">{number}</span>
        </div>
        <Icon size={16} className="text-primary-500 shrink-0" />
        <h2 className="font-serif font-bold text-neutral-900 dark:text-white text-base">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  )
}

/* ── Custom dropdown ──────────────────────────────────────── */
function CustomSelect({ label, required, value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <FieldLabel required={required}>{label}</FieldLabel>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`${inputCls} flex items-center justify-between text-left ${!value ? 'text-neutral-400' : ''}`}
      >
        <span>{value || placeholder || `Select ${label}`}</span>
        <ChevronDown size={14} className={`text-neutral-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full max-h-56 overflow-y-auto bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 rounded-xl shadow-2xl"
          >
            {options.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false) }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    value === opt
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-700'
                  }`}
                >
                  {opt}
                  {value === opt && <Check size={13} className="text-primary-500" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Time dropdown (scrollable) ───────────────────────────── */
function TimeSelect({ label, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open && value && listRef.current) {
      const idx = TIME_OPTIONS.indexOf(value)
      if (idx > -1) {
        const item = listRef.current.children[idx]
        item?.scrollIntoView({ block: 'center' })
      }
    }
  }, [open, value])

  return (
    <div ref={ref} className="relative flex-1">
      <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">{label}</p>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm transition-all focus:outline-none hover:border-primary-400 ${!value ? 'text-neutral-400' : 'text-neutral-900 dark:text-white font-medium'}`}
      >
        <span>{value || 'Select'}</span>
        <ChevronDown size={13} className={`text-neutral-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.13 }}
            className="absolute z-50 mt-1 w-36 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 rounded-xl shadow-xl overflow-y-auto max-h-48 scrollbar-thin"
          >
            {TIME_OPTIONS.map((t) => (
              <li key={t}>
                <button
                  type="button"
                  onClick={() => { onChange(t); setOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    value === t
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-700'
                  }`}
                >
                  {t}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Visiting Hours field ─────────────────────────────────── */
function VisitingHoursField({ value, onChange }) {
  // value shape: { startTime, endTime, days: [] }
  const toggleDay = (day) => {
    const days = value.days.includes(day)
      ? value.days.filter((d) => d !== day)
      : [...value.days, day]
    onChange({ ...value, days })
  }

  return (
    <div>
      <FieldLabel><span className="flex items-center gap-1"><Clock size={12} /> Visiting Hours</span></FieldLabel>
      <div className="space-y-3 bg-neutral-50 dark:bg-dark-700/40 border border-neutral-200 dark:border-dark-600 rounded-xl p-4">

        {/* Time pickers row */}
        <div className="flex items-end gap-3">
          <TimeSelect label="Opens at" value={value.startTime} onChange={(v) => onChange({ ...value, startTime: v })} />
          <span className="pb-2 text-neutral-400 text-sm shrink-0">—</span>
          <TimeSelect label="Closes at" value={value.endTime} onChange={(v) => onChange({ ...value, endTime: v })} />
        </div>

        {/* Weekday chips */}
        <div>
          <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Open on days</p>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day) => {
              const active = value.days.includes(day)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30'
                      : 'bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 text-neutral-500 dark:text-neutral-400 hover:border-primary-400 hover:text-primary-500'
                  }`}
                >
                  {day}
                </button>
              )
            })}
            {/* Quick select all / weekdays */}
            <div className="flex gap-1.5 ml-1 items-center">
              <button type="button" onClick={() => onChange({ ...value, days: [...DAYS] })}
                className="text-[10px] text-primary-500 hover:underline font-medium">All</button>
              <span className="text-neutral-300 text-xs">|</span>
              <button type="button" onClick={() => onChange({ ...value, days: ['Mon','Tue','Wed','Thu','Fri'] })}
                className="text-[10px] text-primary-500 hover:underline font-medium">Weekdays</button>
              <span className="text-neutral-300 text-xs">|</span>
              <button type="button" onClick={() => onChange({ ...value, days: [] })}
                className="text-[10px] text-neutral-400 hover:underline">Clear</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function TextField({ label, required, value, onChange, placeholder, type = 'text' }) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required} className={inputCls} />
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────── */
export default function ContributePage() {
  const router = useRouter()
  const fileRef = useRef(null)
  const { user, token } = useAuthStore()
  const [submitting, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [imageData, setImageData] = useState([])  // [{ dataUrl, sizeKB, name }]
  const [compressing, setCompressing] = useState(false)
  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState({
    name: '', category: '', subCategory: '', description: '',
    latitude: '', longitude: '', address: '',
    visitingHours: { startTime: '', endTime: '', days: [] },
    entryFee: '', amenities: [],
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('edit')
    if (id) {
      setEditId(id)
      fetch(`/api/places/${id}`)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            const p = json.data
            setForm({
              name: p.name || '',
              category: p.category || '',
              subCategory: p.subCategory || '',
              description: p.description || '',
              latitude: p.location?.lat?.toString() || '',
              longitude: p.location?.lng?.toString() || '',
              address: p.location?.address || '',
              visitingHours: p.visitingHoursMeta || { startTime: '', endTime: '', days: [] },
              entryFee: p.entryFee || '',
              amenities: p.amenities || [],
            })
            if (p.images?.length) {
              setImageData(p.images.map(url => ({ dataUrl: url, sizeKB: 0, name: 'Existing Image' })))
            }
          }
        })
        .catch(() => toast.error('Failed to load place data'))
    }
  }, [])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleFetchAddress = async () => {
    if (!form.latitude || !form.longitude) {
      toast.error('Enter latitude and longitude first')
      return
    }
    const loadingToast = toast.loading('Fetching address...')
    try {
      const address = await reverseGeocode(form.latitude, form.longitude)
      if (address) {
        set('address', address)
        toast.success('Address updated!', { id: loadingToast })
      } else {
        toast.error('Could not find address for these coordinates', { id: loadingToast })
      }
    } catch (err) {
      toast.error(err.message, { id: loadingToast })
    }
  }

  const toggleAmenity = (id) =>
    set('amenities', form.amenities.includes(id)
      ? form.amenities.filter((a) => a !== id)
      : [...form.amenities, id])

  const MAX_IMAGES = 5

  const handleFiles = async (files) => {
    const list = Array.from(files).slice(0, MAX_IMAGES - imageData.length)
    if (!list.length) return
    setCompressing(true)
    try {
      const results = await Promise.all(list.map(f => compressToBase64(f).then(r => ({ ...r, name: f.name }))))
      setImageData(prev => [...prev, ...results].slice(0, MAX_IMAGES))
      const totalKB = results.reduce((s, r) => s + r.sizeKB, 0)
      toast.success(`${results.length} image${results.length > 1 ? 's' : ''} ready (${totalKB} KB)`)
    } catch (err) {
      toast.error('Failed to process image: ' + err.message)
    }
    setCompressing(false)
  }

  const removeImage = (idx) =>
    setImageData(prev => prev.filter((_, i) => i !== idx))

  // Build human-readable visiting hours string for the API
  const formatHours = (vh) => {
    const parts = []
    if (vh.startTime && vh.endTime) parts.push(`${vh.startTime} – ${vh.endTime}`)
    if (vh.days.length) parts.push(vh.days.join(', '))
    return parts.join(' | ')
  }

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault()
    if (!form.name || !form.category || !form.description) {
      toast.error('Fill in the required fields (name, category, description).')
      return
    }
    setSaving(true)
    try {
      const t = token || localStorage.getItem('auth_token')
      const payload = {
        name: form.name, category: form.category, subCategory: form.subCategory,
        description: form.description, fullDescription: form.description,
        location: {
          address: form.address,
          lat: form.latitude ? parseFloat(form.latitude) : undefined,
          lng: form.longitude ? parseFloat(form.longitude) : undefined,
        },
        visitingHours: formatHours(form.visitingHours),
        visitingHoursMeta: form.visitingHours,
        entryFee: form.entryFee, amenities: form.amenities,
        images: imageData.map(img => img.dataUrl),
        status: isDraft ? 'Draft' : 'Pending',
      }

      const url = editId ? `/api/places/${editId}` : '/api/places'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(t ? { Authorization: `Bearer ${t}` } : {}),
        },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || 'Submission failed')
      
      if (editId) {
        toast.success('Update submitted for review!')
        router.push(user?.role === 'admin' ? '/admin' : '/dashboard')
      } else {
        toast.success(isDraft ? 'Draft saved!' : 'Submitted for review! Thank you.')
        if (!isDraft) router.push('/explore')
      }
    } catch (err) {
      toast.error(err.message || 'Something went wrong')
    } finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-dark-900 pb-28">

      {/* Hero header */}
      <section className="pt-20 pb-10 px-4 relative border-b border-neutral-200/60 dark:border-dark-800/60 bg-white dark:bg-dark-900">
        <div className="absolute top-8 left-8 hidden sm:block">
           <Link 
            href={user?.role === 'admin' ? '/admin' : '/dashboard'} 
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors group"
           >
              <div className="w-10 h-10 rounded-full bg-neutral-50 dark:bg-dark-800 flex items-center justify-center border border-neutral-200 dark:border-dark-700 group-hover:border-primary-500/50">
                <ArrowLeft size={20} />
              </div>
              <span className="text-sm font-medium">
                {user?.role === 'admin' ? 'Back to Admin Panel' : 'Back to Dashboard'}
              </span>
           </Link>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="text-center">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-neutral-900 dark:text-white mb-3">
            {editId ? 'Edit Landmark' : 'Contribute a Landmark'}
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-lg mx-auto leading-relaxed">
            {editId 
              ? 'Your updates will be reviewed by our moderation team before being published.'
              : 'Help preserve and share the heritage of Villupuram by submitting detailed information, accurate locations, and high-quality photographs.'
            }
          </p>
        </motion.div>
      </section>

      <form onSubmit={(e) => handleSubmit(e, false)} className="max-w-2xl mx-auto px-4 sm:px-6 mt-10 space-y-6">

        {/* 1. Basic Information */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
          <SectionCard number="1" title="Basic Information" icon={Landmark}>
            <TextField label="Place Name" required value={form.name}
              onChange={(v) => set('name', v)} placeholder="e.g. Gingee Fort" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CustomSelect label="Primary Category" required value={form.category}
                onChange={(v) => set('category', v)} options={CATEGORIES} placeholder="Select a category" />
              <CustomSelect label="Historical / Spiritual" value={form.subCategory}
                onChange={(v) => set('subCategory', v)} options={SUB_CATEGORIES} placeholder="e.g. Fortress, Palace…" />
            </div>

            <div>
              <FieldLabel required>Brief Description</FieldLabel>
              <textarea rows={4} value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Describe the historical significance and key features…"
                required className={`${inputCls} resize-none`} />
            </div>
          </SectionCard>
        </motion.div>

        {/* 2. Location & Access */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <SectionCard number="2" title="Location & Access" icon={MapPin}>

            {/* Map placeholder */}
            <div>
              <FieldLabel required>Map Preview</FieldLabel>
              <div className="h-48 rounded-xl bg-neutral-100 dark:bg-dark-700 border border-neutral-200 dark:border-dark-600 relative overflow-hidden flex items-center justify-center">
                {form.latitude && form.longitude ? (
                  <iframe
                    title="Map Preview"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={getEmbedMapUrl({ lat: form.latitude, lng: form.longitude })}
                    allowFullScreen
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-neutral-400">
                    <MapPin size={32} />
                    <p className="text-xs">Enter coordinates below to see preview</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <TextField label="Latitude" value={form.latitude} onChange={(v) => set('latitude', v)} placeholder="e.g. 12.2506" />
                <TextField label="Longitude" value={form.longitude} onChange={(v) => set('longitude', v)} placeholder="e.g. 79.4193" />
              </div>
              
              <button 
                type="button" 
                onClick={handleFetchAddress}
                className="mt-3 w-full py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-lg border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={12} /> FETCH ADDRESS FROM COORDS
              </button>
            </div>

            <div>
              <FieldLabel>Physical Address</FieldLabel>
              <textarea rows={2} value={form.address} onChange={(e) => set('address', e.target.value)}
                placeholder="Street / Village, District, Tamil Nadu"
                className={`${inputCls} resize-none`} />
            </div>

            {/* Visiting Hours — custom */}
            <VisitingHoursField
              value={form.visitingHours}
              onChange={(v) => set('visitingHours', v)}
            />

            <div>
              <FieldLabel><span className="flex items-center gap-1"><DollarSign size={12} /> Entry Fee (INR)</span></FieldLabel>
              <input type="text" value={form.entryFee} onChange={(e) => set('entryFee', e.target.value)}
                placeholder="e.g. ₹25 Indians / ₹250 Foreign" className={inputCls} />
            </div>
          </SectionCard>
        </motion.div>

        {/* 3. Media & Accessibility */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <SectionCard number="3" title="Media & Accessibility" icon={ImageIcon}>

            <div>
              <FieldLabel required>Photographs</FieldLabel>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
                onClick={() => !compressing && fileRef.current?.click()}
                className={`rounded-xl border-2 border-dashed transition-colors flex flex-col items-center justify-center gap-2 py-10 ${
                  compressing ? 'opacity-60 cursor-wait' :
                  dragOver ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 cursor-copy' :
                  imageData.length >= MAX_IMAGES ? 'border-neutral-200 dark:border-dark-700 cursor-not-allowed opacity-50' :
                  'border-neutral-300 dark:border-dark-600 bg-neutral-50 dark:bg-dark-700/40 hover:border-primary-300 cursor-pointer'
                }`}
              >
                {compressing ? (
                  <><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-neutral-500">Compressing…</p></>
                ) : (
                  <><CloudUpload size={32} className={dragOver ? 'text-primary-500' : 'text-neutral-400'} />
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Drag and drop photos here</p>
                  <p className="text-xs text-neutral-400">or click to browse · auto-compressed to save space</p>
                  <p className="text-xs text-neutral-300 dark:text-neutral-600 mt-1">JPG, PNG, WebP · up to {MAX_IMAGES} photos</p></>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />

              {imageData.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {imageData.map((img, i) => (
                    <div key={i} className="relative group">
                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-neutral-200 dark:border-dark-600">
                        <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5 rounded-b-xl">
                        {img.sizeKB} KB
                      </div>
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ))}
                  <div className="text-[10px] text-neutral-400 self-end pb-1 ml-1">
                    Total: {imageData.reduce((s, i) => s + i.sizeKB, 0)} KB · {imageData.length}/{MAX_IMAGES}
                  </div>
                </div>
              )}
            </div>

            <div>
              <FieldLabel>Accessibility & Amenities</FieldLabel>
              <div className="flex flex-wrap gap-3">
                {AMENITIES.map(({ id, label }) => {
                  const checked = form.amenities.includes(id)
                  return (
                    <label key={id} className="flex items-center gap-2 cursor-pointer group">
                      <div onClick={() => toggleAmenity(id)}
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          checked ? 'bg-primary-500 border-primary-500' : 'border-neutral-300 dark:border-dark-500 group-hover:border-primary-400'
                        }`}>
                        {checked && <Check size={10} className="text-white" />}
                      </div>
                      <span className={`text-sm transition-colors ${checked ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-neutral-600 dark:text-neutral-400'}`}>
                        {label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
          </SectionCard>
        </motion.div>

        {/* Action buttons */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.2 }}
          className="flex gap-3 justify-end pt-2">
          {!editId && (
            <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 border-2 border-neutral-300 dark:border-dark-600 text-neutral-700 dark:text-neutral-300 hover:border-primary-400 hover:text-primary-600 text-sm font-semibold rounded-xl transition-colors">
              <Save size={15} /> Save as Draft
            </button>
          )}
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 bg-secondary-500 hover:bg-secondary-600 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors shadow-md">
            <Send size={15} />
            {submitting ? 'Submitting…' : (editId ? 'Submit Update' : 'Submit for Review')}
          </button>
        </motion.div>
      </form>
    </div>
  )
}

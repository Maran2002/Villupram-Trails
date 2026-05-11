'use client'

import { useState, useRef, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, ChevronDown, CloudUpload, X, Clock, DollarSign,
  Check, Landmark, FileText, Image as ImageIcon, Save, Send, ArrowLeft, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'
import { compressToBase64 } from '@/lib/imageUtils'
import Link from 'next/link'

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

function FieldLabel({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5 uppercase tracking-wide">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

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
      <button type="button" onClick={() => setOpen(!open)}
        className={`${inputCls} flex items-center justify-between text-left ${!value ? 'text-neutral-400' : ''}`}>
        <span>{value || placeholder || `Select ${label}`}</span>
        <ChevronDown size={14} className={`text-neutral-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}
            className="absolute z-50 mt-1.5 w-full max-h-56 overflow-y-auto bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 rounded-xl shadow-2xl">
            {options.map((opt) => (
              <li key={opt}>
                <button type="button" onClick={() => { onChange(opt); setOpen(false) }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                    value === opt ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-700'
                  }`}>{opt}{value === opt && <Check size={13} className="text-primary-500" />}</button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

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
      if (idx > -1) { listRef.current.children[idx]?.scrollIntoView({ block: 'center' }) }
    }
  }, [open, value])
  return (
    <div ref={ref} className="relative flex-1">
      <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-1">{label}</p>
      <button type="button" onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-dark-600 bg-white dark:bg-dark-800 text-sm transition-all focus:outline-none hover:border-primary-400 ${!value ? 'text-neutral-400' : 'text-neutral-900 dark:text-white font-medium'}`}>
        <span>{value || 'Select'}</span>
        <ChevronDown size={13} className={`text-neutral-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul ref={listRef} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 mt-1 w-36 bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 rounded-xl shadow-xl overflow-y-auto max-h-48">
            {TIME_OPTIONS.map((t) => (
              <li key={t}>
                <button type="button" onClick={() => { onChange(t); setOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${value === t ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-semibold' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-dark-700'}`}>{t}</button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

function VisitingHoursField({ value, onChange }) {
  const toggleDay = (day) => {
    const days = value.days.includes(day) ? value.days.filter((d) => d !== day) : [...value.days, day]
    onChange({ ...value, days })
  }
  return (
    <div>
      <FieldLabel><span className="flex items-center gap-1"><Clock size={12} /> Visiting Hours</span></FieldLabel>
      <div className="space-y-3 bg-neutral-50 dark:bg-dark-700/40 border border-neutral-200 dark:border-dark-600 rounded-xl p-4">
        <div className="flex items-end gap-3">
          <TimeSelect label="Opens at" value={value.startTime} onChange={(v) => onChange({ ...value, startTime: v })} />
          <span className="pb-2 text-neutral-400 text-sm shrink-0">—</span>
          <TimeSelect label="Closes at" value={value.endTime} onChange={(v) => onChange({ ...value, endTime: v })} />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">Open on days</p>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((day) => (
              <button key={day} type="button" onClick={() => toggleDay(day)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${value.days.includes(day) ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/30' : 'bg-white dark:bg-dark-800 border border-neutral-200 dark:border-dark-600 text-neutral-500 dark:text-neutral-400 hover:border-primary-400'}`}>{day}</button>
            ))}
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
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className={inputCls} />
    </div>
  )
}

export default function AdminPlaceEditPage({ params: paramsPromise }) {
  const params = use(paramsPromise)
  const placeId = params.placeId
  const router = useRouter()
  const fileRef = useRef(null)
  const token = useAuthStore((s) => s.token)
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [imageData, setImageData] = useState([]) // [{ dataUrl, sizeKB, name }]

  const [form, setForm] = useState({
    name: '', category: '', subCategory: '', description: '',
    latitude: '', longitude: '', address: '',
    visitingHours: { startTime: '', endTime: '', days: [] },
    entryFee: '', amenities: [], status: 'Pending'
  })

  useEffect(() => {
    const fetchPlace = async () => {
      const t = token || localStorage.getItem('auth_token')
      try {
        const res = await fetch(`/api/places/${placeId}`, { headers: { Authorization: `Bearer ${t}` } })
        const d = await res.json()
        if (d.success) {
          const p = d.data
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
            status: p.status || 'Pending'
          })
          if (p.images) {
            setImageData(p.images.map(url => ({ dataUrl: url, sizeKB: 0, name: 'existing' })))
          }
        } else { toast.error('Place not found') }
      } catch { toast.error('Failed to load place') }
      setLoading(false)
    }
    fetchPlace()
  }, [placeId, token])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const toggleAmenity = (id) => set('amenities', form.amenities.includes(id) ? form.amenities.filter((a) => a !== id) : [...form.amenities, id])

  const handleFiles = async (files) => {
    const list = Array.from(files).slice(0, 5 - imageData.length)
    if (!list.length) return
    setCompressing(true)
    try {
      const results = await Promise.all(list.map(f => compressToBase64(f).then(r => ({ ...r, name: f.name }))))
      setImageData(prev => [...prev, ...results].slice(0, 5))
    } catch (err) { toast.error('Failed to process image') }
    setCompressing(false)
  }

  const formatHours = (vh) => {
    const parts = []
    if (vh.startTime && vh.endTime) parts.push(`${vh.startTime} – ${vh.endTime}`)
    if (vh.days.length) parts.push(vh.days.join(', '))
    return parts.join(' | ')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const t = token || localStorage.getItem('auth_token')
      const payload = {
        name: form.name, category: form.category, subCategory: form.subCategory,
        description: form.description,
        location: {
          address: form.address,
          lat: form.latitude ? parseFloat(form.latitude) : undefined,
          lng: form.longitude ? parseFloat(form.longitude) : undefined,
        },
        visitingHours: formatHours(form.visitingHours),
        visitingHoursMeta: form.visitingHours,
        entryFee: form.entryFee, amenities: form.amenities,
        images: imageData.map(img => img.dataUrl),
        status: form.status
      }
      const res = await fetch(`/api/places/${placeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify(payload),
      })
      const d = await res.json()
      if (!d.success) throw new Error(d.error)
      toast.success('Place updated successfully ✓')
      router.push('/admin/places')
    } catch (err) { toast.error(err.message || 'Update failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><RefreshCw className="animate-spin text-primary-500" size={32} /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/admin/places" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-primary-500 transition-colors">
        <ArrowLeft size={16} /> Back to Places
      </Link>
      
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">Edit Place</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 uppercase font-bold tracking-wider">Status:</span>
          <select value={form.status} onChange={e => set('status', e.target.value)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-dark-600 bg-white dark:bg-dark-800">
            {['Approved', 'Pending', 'Rejected', 'Draft'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard number="1" title="Core Information" icon={Landmark}>
          <TextField label="Place Name" required value={form.name} onChange={(v) => set('name', v)} />
          <div className="grid grid-cols-2 gap-4">
            <CustomSelect label="Category" required value={form.category} onChange={(v) => set('category', v)} options={CATEGORIES} />
            <CustomSelect label="Historical / Spiritual" value={form.subCategory} onChange={(v) => set('subCategory', v)} options={SUB_CATEGORIES} />
          </div>
          <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Description..." required className={`${inputCls} resize-none`} />
        </SectionCard>

        <SectionCard number="2" title="Location & Hours" icon={MapPin}>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Latitude" value={form.latitude} onChange={(v) => set('latitude', v)} />
            <TextField label="Longitude" value={form.longitude} onChange={(v) => set('longitude', v)} />
          </div>
          <TextField label="Address" value={form.address} onChange={(v) => set('address', v)} />
          <VisitingHoursField value={form.visitingHours} onChange={(v) => set('visitingHours', v)} />
          <TextField label="Entry Fee" value={form.entryFee} onChange={(v) => set('entryFee', v)} />
        </SectionCard>

        <SectionCard number="3" title="Media & Amenities" icon={ImageIcon}>
          <FieldLabel>Photos ({imageData.length}/5)</FieldLabel>
          <div className="flex flex-wrap gap-2 mb-4">
            {imageData.map((img, i) => (
              <div key={i} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 dark:border-dark-600">
                <img src={img.dataUrl} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImageData(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
              </div>
            ))}
            {imageData.length < 5 && (
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-neutral-300 dark:border-dark-600 flex items-center justify-center text-neutral-400 hover:border-primary-400 hover:text-primary-500 transition-all">
                <CloudUpload size={24} />
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          
          <FieldLabel>Amenities</FieldLabel>
          <div className="flex flex-wrap gap-3">
            {AMENITIES.map(({ id, label }) => (
              <label key={id} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.amenities.includes(id)} onChange={() => toggleAmenity(id)} className="w-4 h-4 text-primary-500 border-neutral-300 rounded" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
              </label>
            ))}
          </div>
        </SectionCard>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={submitting || compressing}
            className="flex items-center gap-2 px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl shadow-lg shadow-primary-500/25 disabled:opacity-50 transition-all">
            {submitting ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import { 
  User, Mail, Camera, Save, MapPin, 
  FileText, Loader2, Shield, Lock, Activity, Key, Eye, EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import { compressToBase64 } from '@/lib/imageUtils'

export default function AdminProfilePage() {
  const { user, token, setUser } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPass, setChangingPass] = useState(false)

  const [form, setForm] = useState({
    username: '', email: '', bio: '', location: '', profileImage: ''
  })
  const [passForm, setPassForm] = useState({
    oldPassword: '', newPassword: '', confirmPassword: ''
  })
  const [showPass, setShowPass] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        profileImage: user.profileImage || ''
      })
      setLoading(false)
    }
  }, [user])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const loadingToast = toast.loading('Processing image...')
    try {
      const result = await compressToBase64(file, { maxWidth: 400, quality: 0.7 })
      setForm(prev => ({ ...prev, profileImage: result.dataUrl }))
      toast.success('Image ready!', { id: loadingToast })
    } catch (err) { toast.error('Failed to process image', { id: loadingToast }) }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setUser(data.data)
      toast.success('Admin profile updated!')
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) return toast.error('Passwords do not match')
    setChangingPass(true)
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ oldPassword: passForm.oldPassword, newPassword: passForm.newPassword })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      toast.success('Admin password changed!')
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.message) }
    finally { setChangingPass(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-800 p-6 rounded-3xl border border-neutral-200 dark:border-dark-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-lg">
              {form.profileImage ? <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" /> : user?.username?.charAt(0).toUpperCase()}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-1.5 bg-white dark:bg-dark-700 text-neutral-600 dark:text-neutral-300 rounded-lg shadow-md border border-neutral-200 dark:border-dark-600 hover:text-primary-500 transition-colors"><Camera size={14} /></button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{user?.username}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full bg-primary-500 text-white text-[10px] font-bold tracking-wider uppercase">{user?.role}</span>
              <span className="text-xs text-neutral-400 flex items-center gap-1"><Activity size={10} /> Active Admin Session</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-200 dark:border-dark-700 p-8 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-2"><User size={18} className="text-primary-500" /> Identity Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Admin Username</label>
                <input type="text" value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Contact Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Base Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Admin Bio</label>
              <textarea rows={4} value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm resize-none" />
            </div>
            <button type="submit" disabled={saving} className="px-8 flex items-center justify-center gap-2 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/20">{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Update Admin Info</button>
          </form>
        </div>

        <div className="space-y-6">
          <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-200 dark:border-dark-700 p-8 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-2"><Key size={18} className="text-primary-500" /> Security Access</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Current Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={passForm.oldPassword} onChange={(e) => setPassForm(p => ({ ...p, oldPassword: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 transition-colors">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">New Admin Password</label>
                <input type="password" value={passForm.newPassword} onChange={(e) => setPassForm(p => ({ ...p, newPassword: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" required minLength={6} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Confirm Password</label>
                <input type="password" value={passForm.confirmPassword} onChange={(e) => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" required minLength={6} />
              </div>
            </div>
            <button type="submit" disabled={changingPass} className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-60 transition-all flex items-center justify-center gap-2">{changingPass ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Update Access</button>
          </form>

          <div className="bg-neutral-900 dark:bg-dark-700 rounded-3xl p-6 text-white border border-white/5 shadow-xl">
            <Lock size={24} className="mb-3 opacity-80" />
            <h3 className="font-bold text-sm mb-1">Privileged Access</h3>
            <p className="text-[11px] opacity-60 leading-relaxed">Admin passwords grant full access to system records and audit trails. Keep your credentials secure.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

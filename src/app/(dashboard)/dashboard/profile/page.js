'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/lib/store'
import { 
  User, Mail, Camera, Save, MapPin, 
  FileText, Loader2, Shield, Lock, Eye, EyeOff, Key
} from 'lucide-react'
import toast from 'react-hot-toast'
import { compressToBase64 } from '@/lib/imageUtils'
import apiClient from '@/lib/api'

export default function UserProfilePage() {
  const { user, setUser } = useAuthStore()
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
    } catch (err) {
      toast.error('Failed to process image', { id: loadingToast })
    }
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await apiClient.put('/user/profile', form)
      if (data.success) {
        setUser(data.data)
        toast.success('Profile updated!')
      }
    } catch (err) { 
      if (err.code === 401) return 
      toast.error(err.message) 
    } finally { setSaving(false) }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error('New passwords do not match')
    }
    setChangingPass(true)
    try {
      const { data } = await apiClient.put('/user/password', { 
        oldPassword: passForm.oldPassword, 
        newPassword: passForm.newPassword 
      })
      if (data.success) {
        toast.success('Password updated successfully!')
        setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch (err) { 
      if (err.code === 401) return
      toast.error(err.message) 
    } finally { setChangingPass(false) }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-1">Account Settings</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Manage your profile and security settings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-200 dark:border-dark-700 p-8 flex flex-col items-center gap-6 shadow-sm">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full border-4 border-neutral-100 dark:border-dark-700 overflow-hidden bg-neutral-50 dark:bg-dark-900 flex items-center justify-center ring-0 group-hover:ring-4 ring-primary-500/20 transition-all duration-300">
                  {form.profileImage ? <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" /> : <User size={40} className="text-neutral-300" />}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-transform hover:scale-110"><Camera size={16} /></button>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>
              <div className="text-center"><h3 className="font-bold text-sm text-neutral-900 dark:text-white">Profile Photo</h3></div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-200 dark:border-dark-700 p-8 space-y-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><User size={12} /> Username</label>
                  <input type="text" value={form.username} onChange={(e) => setForm(f => ({ ...f, username: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><Mail size={12} /> Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><MapPin size={12} /> Location</label>
                <input type="text" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" placeholder="City, State" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2"><FileText size={12} /> Bio</label>
                <textarea rows={3} value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm resize-none" placeholder="A bit about yourself..." />
              </div>
              <button type="submit" disabled={saving} className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2">{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Profile</button>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-200 dark:border-dark-700 p-8 shadow-sm space-y-6">
            <h3 className="font-serif font-bold text-neutral-900 dark:text-white flex items-center gap-2 mb-2"><Key size={18} className="text-primary-500" /> Password & Security</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Current Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={passForm.oldPassword} onChange={(e) => setPassForm(p => ({ ...p, oldPassword: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 transition-colors">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">New Password</label>
                <input type="password" value={passForm.newPassword} onChange={(e) => setPassForm(p => ({ ...p, newPassword: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" required minLength={6} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Confirm New Password</label>
                <input type="password" value={passForm.confirmPassword} onChange={(e) => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" required minLength={6} />
              </div>
            </div>
            <button type="submit" disabled={changingPass} className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-bold rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-60 transition-all flex items-center justify-center gap-2">{changingPass ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />} Update Password</button>
          </form>
          <div className="bg-primary-500 rounded-3xl p-6 text-white shadow-xl">
            <Shield size={24} className="mb-3 opacity-80" /><h3 className="font-bold text-sm mb-1">Two-Factor Auth</h3><p className="text-[11px] opacity-80 leading-relaxed">Enhance your account security by enabling 2FA. (Coming Soon)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

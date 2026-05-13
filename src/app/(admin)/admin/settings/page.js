'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Globe, Mail, Phone, MapPin, 
  Save, Loader2, Image as ImageIcon, Layout,
  Shield, Megaphone, Info, Camera
} from 'lucide-react'
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'
import { compressToBase64 } from '@/lib/imageUtils'
import apiClient from '@/lib/api'

import { WithPermission } from '@/components/admin/WithPermission'

export default function AdminSettingsPage() {
  const { token, logout } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    siteName: '',
    siteLogo: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      youtube: ''
    },
    seoDescription: '',
    requirePlaceApproval: true,
    requireReviewApproval: false
  })
  
  const logoInputRef = useRef(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      // Using axios apiClient which has the 401 interceptor
      const { data } = await apiClient.get('/admin/settings')
      if (data.success) {
        setForm(data.data)
      }
    } catch (err) {
      if (err.code === 401) return // Interceptor handles redirect
      toast.error(err.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const loadingToast = toast.loading('Processing logo...')
    try {
      const result = await compressToBase64(file, { maxWidth: 300, quality: 0.8 })
      setForm(prev => ({ ...prev, siteLogo: result.dataUrl }))
      toast.success('Logo ready!', { id: loadingToast })
    } catch (err) {
      toast.error('Failed to process image', { id: loadingToast })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await apiClient.put('/admin/settings', form)
      if (data.success) {
        toast.success('Site settings updated successfully!')
      }
    } catch (err) {
      if (err.code === 401) return // Interceptor handles redirect
      toast.error(err.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>

  return (
    <WithPermission module="settings" action="view">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-serif font-bold text-neutral-900 dark:text-white mb-2">General Settings</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">Configure global site information, contact details, and branding.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Main Branding & Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Branding Card */}
            <div className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-200 dark:border-dark-700 p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-dark-700 pb-4 mb-2">
                <Layout size={18} className="text-primary-500" /> Site Branding
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-8 items-start">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Site Logo</label>
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-neutral-50 dark:bg-dark-900 border-2 border-dashed border-neutral-200 dark:border-dark-700 flex items-center justify-center overflow-hidden">
                      {form.siteLogo ? (
                        <img src={form.siteLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon size={32} className="text-neutral-300" />
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-dark-700 border border-neutral-200 dark:border-dark-600 rounded-lg shadow-md text-primary-500 hover:scale-110 transition-transform"
                    >
                      <Camera size={14} />
                    </button>
                    <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Site Name</label>
                    <input 
                      type="text" 
                      value={form.siteName} 
                      onChange={(e) => setForm(f => ({ ...f, siteName: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm font-medium"
                      placeholder="e.g. Villupuram Hub"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">SEO Meta Description</label>
                    <textarea 
                      rows={2}
                      value={form.seoDescription} 
                      onChange={(e) => setForm(f => ({ ...f, seoDescription: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm resize-none"
                      placeholder="Brief description for search engines..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-200 dark:border-dark-700 p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-dark-700 pb-4 mb-2">
                <Mail size={18} className="text-primary-500" /> Contact Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} /> Contact Email
                  </label>
                  <input 
                    type="email" 
                    value={form.contactEmail} 
                    onChange={(e) => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm"
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={12} /> Contact Phone
                  </label>
                  <input 
                    type="text" 
                    value={form.contactPhone} 
                    onChange={(e) => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} /> Office Address
                </label>
                <textarea 
                  rows={2}
                  value={form.address} 
                  onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm resize-none"
                  placeholder="Physical address..."
                />
              </div>
            </div>
            
            {/* Moderation Settings Card */}
            <div className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-200 dark:border-dark-700 p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-dark-700 pb-4 mb-2">
                <Shield size={18} className="text-primary-500" /> Moderation & Approvals
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-dark-900 rounded-2xl border border-neutral-100 dark:border-dark-700">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">Require Approval for New Places</p>
                    <p className="text-xs text-neutral-500">If enabled, places added by users will start as "Pending" and require admin approval.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setForm(f => ({ ...f, requirePlaceApproval: !f.requirePlaceApproval }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.requirePlaceApproval ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-dark-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.requirePlaceApproval ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-dark-900 rounded-2xl border border-neutral-100 dark:border-dark-700">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">Moderate New Reviews</p>
                    <p className="text-xs text-neutral-500">If enabled, new reviews will be hidden by default until an admin approves them.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setForm(f => ({ ...f, requireReviewApproval: !f.requireReviewApproval }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.requireReviewApproval ? 'bg-primary-500' : 'bg-neutral-300 dark:bg-dark-600'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.requireReviewApproval ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Social & Actions */}
          <div className="space-y-8">
            
            {/* Social Links Card */}
            <div className="bg-white dark:bg-dark-800 rounded-3xl border border-neutral-200 dark:border-dark-700 p-8 shadow-sm space-y-6">
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-dark-700 pb-4 mb-2">
                <Globe size={18} className="text-primary-500" /> Social Presence
              </h3>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    <FaFacebook size={12} /> Facebook
                  </div>
                  <input 
                    type="text" 
                    value={form.socialLinks.facebook} 
                    onChange={(e) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, facebook: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 text-xs focus:outline-none focus:border-primary-500"
                    placeholder="URL..."
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    <FaTwitter size={12} /> Twitter (X)
                  </div>
                  <input 
                    type="text" 
                    value={form.socialLinks.twitter} 
                    onChange={(e) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, twitter: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 text-xs focus:outline-none focus:border-primary-500"
                    placeholder="URL..."
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    <FaInstagram size={12} /> Instagram
                  </div>
                  <input 
                    type="text" 
                    value={form.socialLinks.instagram} 
                    onChange={(e) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, instagram: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 text-xs focus:outline-none focus:border-primary-500"
                    placeholder="URL..."
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    <FaYoutube size={12} /> YouTube
                  </div>
                  <input 
                    type="text" 
                    value={form.socialLinks.youtube} 
                    onChange={(e) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, youtube: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 text-xs focus:outline-none focus:border-primary-500"
                    placeholder="URL..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Site Settings'}
              </button>
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 p-4 rounded-2xl">
                <div className="flex gap-3 text-amber-600 dark:text-amber-400">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Changes made here are applied globally. Ensure your contact details are verified as they appear in the site footer and about page.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </form>
      </div>
    </WithPermission>
  )
}

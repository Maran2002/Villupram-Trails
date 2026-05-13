import { create } from 'zustand'

export const useSettingsStore = create((set) => ({
  settings: {
    siteName: 'Villupuram Hub',
    siteLogo: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialLinks: { facebook: '', twitter: '', instagram: '', youtube: '' },
    seoDescription: ''
  },
  loading: true,
  fetchSettings: async () => {
    try {
      const res = await fetch('/api/settings/public')
      const data = await res.json()
      if (data.success) {
        set({ settings: data.data, loading: false })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      set({ loading: false })
    }
  }
}))

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import apiClient from '@/lib/api'
import { encryptedStorage } from './storage'

export const useAuthStore = create()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await apiClient.post('/auth/login', { email, password })
          const token = data.data?.token
          const user = data.data?.user
          
          set({ token, user })
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token)
          }
          return data
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (email, password, username) => {
        set({ isLoading: true })
        try {
          const { data } = await apiClient.post('/auth/register', {
            email,
            password,
            username,
          })
          const token = data.data?.token
          const user = data.data?.user
          
          set({ token, user })
          if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token)
          }
          return data
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          const token = get().token || localStorage.getItem('auth_token')
          if (token) {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            })
          }
        } catch {}
        
        set({ user: null, token: null })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth-store') // Explicit clear
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => encryptedStorage),
    }
  )
)

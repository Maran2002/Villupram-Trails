import { create } from 'zustand'
import apiClient from '@/lib/api'

export const useAuthStore = create()(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isSessionChecked: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await apiClient.post('/auth/login', { email, password })
          const user = data.data?.user
          
          set({ token: null, user })
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
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
          set({ token: null, user: null })
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token')
          }
          return data
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await fetch('/api/auth/logout', { method: 'POST' })
        } catch {}
        
        set({ user: null, token: null })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth-store') // Explicit clear
        }
      },

      setUser: (user) => set({ user, isSessionChecked: true }),
      setSessionChecked: (isSessionChecked) => set({ isSessionChecked }),
    })
)

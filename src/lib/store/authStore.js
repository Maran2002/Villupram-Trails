import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClient from '@/lib/api'

export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await apiClient.post('/auth/login', { email, password })
          set({
            token: data.data?.token,
            user: data.data?.user,
          })
          localStorage.setItem('auth_token', data.data?.token)
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
          set({
            token: data.data?.token,
            user: data.data?.user,
          })
          localStorage.setItem('auth_token', data.data?.token)
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          const token = localStorage.getItem('auth_token')
          if (token) {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
            })
          }
        } catch {}
        set({ user: null, token: null })
        localStorage.removeItem('auth_token')
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-store',
    }
  )
)

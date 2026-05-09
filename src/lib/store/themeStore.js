import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create()(
  persist(
    (set) => ({
      theme: (typeof window !== 'undefined' 
        ? localStorage.getItem('theme-store') ? JSON.parse(localStorage.getItem('theme-store')).state.theme : 'light'
        : 'light'),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'theme-store' }
  )
)

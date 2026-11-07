'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { useSettingsStore } from '@/lib/store'
import { useAuthStore } from '@/lib/store'

function SettingsInitializer({ children }) {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return children
}

function AuthInitializer() {
  const setUser = useAuthStore((state) => state.setUser)
  const setSessionChecked = useAuthStore((state) => state.setSessionChecked)

  useEffect(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth-store')
    fetch('/api/auth/me')
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (result?.success && result.data) setUser(result.data)
        else if (!useAuthStore.getState().user) setUser(null)
      })
      .catch(() => {})
      .finally(() => setSessionChecked(true))
  }, [setUser, setSessionChecked])

  return null
}

export function Providers({ children }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      disableTransitionOnChange
    >
      <SettingsInitializer>
        <AuthInitializer />
        {children}
      </SettingsInitializer>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '12px',
            fontWeight: '500',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
        }}
      />
    </ThemeProvider>
  )
}

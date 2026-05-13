'use client'

import { useEffect } from 'react'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { useSettingsStore } from '@/lib/store'

function SettingsInitializer({ children }) {
  const fetchSettings = useSettingsStore((state) => state.fetchSettings)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return children
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

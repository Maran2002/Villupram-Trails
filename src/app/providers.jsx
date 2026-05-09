'use client'

import React from 'react'
import { useThemeStore } from '@/lib/store/themeStore'

export function Providers({ children }) {
  const [mounted, setMounted] = React.useState(false)
  const theme = useThemeStore((state) => state.theme)

  React.useEffect(() => {
    setMounted(true)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (!mounted) return <>{children}</>

  return <>{children}</>
}

'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { hasPermission } from '@/lib/permissions'
import { Loader2 } from 'lucide-react'

export function WithPermission({ module, action = 'view', children }) {
  const { user } = useAuthStore()
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  // Wait for Zustand persist to finish rehydrating from localStorage
  useEffect(() => {
    // If already hydrated (e.g. hot reload), set immediately
    if (useAuthStore.persist?.hasHydrated?.()) {
      setHydrated(true)
      return
    }
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => {
      setHydrated(true)
    })
    // Fallback: mark hydrated after a short delay if the API isn't available
    const fallback = setTimeout(() => setHydrated(true), 300)
    return () => {
      unsub?.()
      clearTimeout(fallback)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return

    if (!user) {
      router.replace('/auth/login')
      return
    }

    if (hasPermission(user, module, action)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthorized(true)
    } else {
      router.replace('/admin')
    }
  }, [hydrated, user, module, action, router])

  if (!hydrated || (!authorized && user)) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
  }
  if (!authorized) return null

  return children
}

// Inline permission wrapper
export function Perm({ module, action = 'view', children }) {
  const { user } = useAuthStore()
  if (!hasPermission(user, module, action)) return null
  return children
}

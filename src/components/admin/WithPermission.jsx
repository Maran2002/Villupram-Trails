'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { hasPermission } from '@/lib/permissions'
import { Loader2 } from 'lucide-react'

export function WithPermission({ module, action = 'view', children }) {
  const { user, isSessionChecked } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isSessionChecked) return
    if (!user) router.replace('/auth/login')
    else if (!hasPermission(user, module, action)) router.replace('/admin')
  }, [isSessionChecked, user, module, action, router])

  if (!isSessionChecked || !user || !hasPermission(user, module, action)) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 text-primary-500 animate-spin" /></div>
  }

  return children
}

// Inline permission wrapper
export function Perm({ module, action = 'view', children }) {
  const { user } = useAuthStore()
  if (!hasPermission(user, module, action)) return null
  return children
}

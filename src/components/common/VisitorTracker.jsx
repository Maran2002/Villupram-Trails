'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // We only track in production or if needed, but for this task we'll track always
    // except for admin pages to avoid polluting logs with admin actions
    if (pathname.startsWith('/admin')) return

    const track = async () => {
      try {
        const data = {
          path: pathname,
          userAgent: navigator.userAgent,
          referer: document.referrer,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          // Device and Browser detection could be more complex, keeping it simple
          device: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
          browser: getBrowser(),
          os: getOS()
        }

        await fetch('/api/visitor/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
      } catch (err) {
        // Silently fail
      }
    }

    // Delay a bit to ensure page is loaded
    const timer = setTimeout(track, 1000)
    return () => clearTimeout(timer)
  }, [pathname])

  return null
}

function getBrowser() {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Other'
}

function getOS() {
  const ua = navigator.userAgent
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  return 'Other'
}

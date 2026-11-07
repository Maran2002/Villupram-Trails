'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function VisitorTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const privatePrefixes = ['/admin', '/auth', '/contribute', '/dashboard']
    if (privatePrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return

    const track = async () => {
      try {
        const data = {
          path: pathname,
          referer: document.referrer,
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
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  return 'Other'
}

function getOS() {
  const ua = navigator.userAgent
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac')) return 'macOS'
  if (ua.includes('Linux')) return 'Linux'
  return 'Other'
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, Loader2, RefreshCw, X, Megaphone, Info, AlertTriangle, Star } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { ErrorState } from '@/components/common/ErrorState'
import toast from 'react-hot-toast'

/* ─── Helpers ────────────────────────────────────────────────────── */

function formatRelativeTime(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 30) return `${diffDay}d ago`
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(date)
}

/** Pick an icon and accent colour based on the optional badge string. */
function resolveBadgeMeta(badge) {
  const b = (badge || '').toLowerCase()
  if (b.includes('alert') || b.includes('warn'))
    return { Icon: AlertTriangle, ring: 'bg-amber-500', iconBg: 'bg-amber-100 dark:bg-amber-900/30', iconColor: 'text-amber-600 dark:text-amber-400' }
  if (b.includes('new') || b.includes('feature') || b.includes('update'))
    return { Icon: Star, ring: 'bg-primary-500', iconBg: 'bg-primary-50 dark:bg-primary-900/30', iconColor: 'text-primary-600 dark:text-primary-400' }
  if (b.includes('info'))
    return { Icon: Info, ring: 'bg-sky-500', iconBg: 'bg-sky-50 dark:bg-sky-900/30', iconColor: 'text-sky-600 dark:text-sky-400' }
  return { Icon: Megaphone, ring: 'bg-primary-500', iconBg: 'bg-primary-50 dark:bg-primary-900/30', iconColor: 'text-primary-600 dark:text-primary-400' }
}

/** Group an array of notifications by relative date label. */
function groupByDay(items) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const fmt = (d) => d.toISOString().slice(0, 10)
  const todayStr = fmt(today)
  const yestStr = fmt(yesterday)

  const groups = new Map()
  for (const item of items) {
    const d = new Date(item.createdAt)
    const key = Number.isNaN(d.getTime())
      ? 'Earlier'
      : fmt(d) === todayStr
        ? 'Today'
        : fmt(d) === yestStr
          ? 'Yesterday'
          : new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(d)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(item)
  }
  return [...groups.entries()]
}

/* ─── Notification Card ──────────────────────────────────────────── */

function NotificationCard({ item, isUnread }) {
  const { Icon, ring, iconBg, iconColor } = resolveBadgeMeta(item.badge)
  const relTime = formatRelativeTime(item.createdAt)

  return (
    <div className={`group flex items-start gap-3.5 rounded-2xl px-4 py-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-dark-800/70 ${isUnread ? 'bg-primary-50/40 dark:bg-primary-900/10' : ''}`}>

      {/* Avatar-style icon with a small badge ring */}
      <div className="relative mt-0.5 shrink-0">
        <div className={`flex h-11 w-11 items-center justify-center rounded-full ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        {/* coloured ring dot mimicking the reference badge */}
        <span className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white dark:border-dark-900 ${ring}`} aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {/* Title */}
            <p className="truncate text-sm font-semibold leading-snug text-neutral-900 dark:text-white">
              {item.title}
            </p>
            {/* Badge pill */}
            {item.badge && (
              <span className="mt-0.5 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                {item.badge}
              </span>
            )}
          </div>

          {/* Right meta column */}
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="whitespace-nowrap text-[11px] text-neutral-400">{relTime}</span>
            {/* Unread dot */}
            {isUnread && (
              <span className="h-2 w-2 rounded-full bg-primary-500" aria-label="Unread" />
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400">
          {item.description}
        </p>
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────────── */

export function NotificationCenter({ className = '' }) {
  const user = useAuthStore((state) => state.user)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  /** Track IDs that were already visible when the panel was opened. */
  const [seenIds, setSeenIds] = useState(new Set())

  const loadNotifications = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/notifications', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error || 'Could not load notifications')
      setItems(Array.isArray(payload.data) ? payload.data : [])
    } catch (requestError) {
      const msg = requestError.message || 'Could not load notifications'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  /* Load on open */
  useEffect(() => {
    if (!open || !user) return
    let active = true

    fetch('/api/notifications', { cache: 'no-store' })
      .then(r => r.json().then(p => ({ r, p })))
      .then(({ r, p }) => {
        if (!active) return
        if (!r.ok || !p.success) throw new Error(p.error || 'Could not load notifications')
        const data = Array.isArray(p.data) ? p.data : []
        setItems(data)
        // First open → mark everything currently fetched as "seen"
        setSeenIds(prev => prev.size === 0 ? new Set(data.map(n => n.id)) : prev)
      })
      .catch(err => {
        if (!active) return
        const msg = err.message || 'Could not load notifications'
        setError(msg)
        toast.error(msg)
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?._id, user?.role])

  const closePanel = useCallback(() => {
    setSeenIds(new Set(items.map(item => item.id)))
    setOpen(false)
  }, [items])

  /* Keyboard close */
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') closePanel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closePanel])

  /* Body scroll lock */
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  const unreadCount = items.filter(n => !seenIds.has(n.id)).length
  const groups = groupByDay(items)

  return (
    <>
      {/* Bell trigger button */}
      <button
        type="button"
        onClick={() => { setLoading(Boolean(user)); setError(''); setOpen(true) }}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-dark-700 ${className}`}
        aria-label="Open notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary-500 px-1 text-center text-[9px] font-bold leading-4 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modal portal */}
      {open && typeof document !== 'undefined' && createPortal((
        <div
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm sm:flex sm:items-center sm:justify-center sm:p-5"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closePanel() }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-dialog-title"
            className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-dark-900 sm:h-auto sm:max-h-[min(82vh,680px)] sm:max-w-md sm:rounded-3xl sm:border sm:border-neutral-200 sm:dark:border-dark-700"
          >
            {/* ── Header ── */}
            <header className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-dark-700/60 sm:px-6">
              <div>
                <h2 id="notification-dialog-title" className="text-lg font-bold text-neutral-900 dark:text-white">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <p className="mt-0.5 text-xs text-neutral-400">{unreadCount} unread</p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={loadNotifications}
                  disabled={loading || !user}
                  aria-label="Refresh notifications"
                  className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 dark:hover:bg-dark-700"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  type="button"
                  onClick={closePanel}
                  aria-label="Close notifications"
                  className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-700"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* ── Body ── */}
            <div className="min-h-0 flex-1 overflow-y-auto py-2">
              {!user ? (
                <div className="mx-4 my-6 rounded-2xl bg-neutral-50 p-8 text-center text-sm text-neutral-500 dark:bg-dark-800 dark:text-neutral-400">
                  Sign in to view notifications for your account.
                </div>
              ) : loading && items.length === 0 ? (
                <div className="flex min-h-44 items-center justify-center gap-2 text-sm text-neutral-500">
                  <Loader2 size={17} className="animate-spin" /> Loading…
                </div>
              ) : error ? (
                <div className="px-4">
                  <ErrorState
                    variant="inline"
                    title="Couldn't Load Notifications"
                    message={error}
                    onRetry={loadNotifications}
                    retryText="Try Again"
                  />
                </div>
              ) : groups.length === 0 ? (
                <div className="mx-4 my-6 flex flex-col items-center justify-center rounded-2xl bg-neutral-50 px-6 py-12 text-center dark:bg-dark-800">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-900/20">
                    <Bell size={22} />
                  </span>
                  <p className="font-semibold text-neutral-800 dark:text-white">You&apos;re all caught up</p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">New community updates will appear here.</p>
                </div>
              ) : (
                <div className="pb-2">
                  {groups.map(([label, notifications]) => (
                    <div key={label}>
                      {/* Day divider */}
                      <div className="sticky top-0 z-10 bg-white px-5 py-2 dark:bg-dark-900">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400">{label}</p>
                      </div>
                      {/* Cards */}
                      <div className="px-2">
                        {notifications.map((item) => (
                          <NotificationCard
                            key={item.id}
                            item={item}
                            isUnread={!seenIds.has(item.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <footer className="border-t border-neutral-100 px-5 py-3 text-center text-[11px] text-neutral-400 dark:border-dark-700/60 sm:px-6">
              Updates are posted by the community team.
            </footer>
          </section>
        </div>
      ), document.body)}
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, CalendarDays, Loader2, RefreshCw, X } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

function monthLabel(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'Earlier'
  return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date)
}

function formatDate(dateValue) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function groupByMonth(items) {
  const groups = new Map()
  for (const item of items) {
    const key = monthLabel(item.createdAt)
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(item)
  }
  return [...groups.entries()]
}

export function NotificationCenter({ className = '' }) {
  const user = useAuthStore((state) => state.user)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      setError(requestError.message || 'Could not load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadNotifications()
  // Reload only when the dialog opens or the active account changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?._id, user?.role])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [open])

  const groups = groupByMonth(items)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-neutral-600 transition hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-dark-700 ${className}`}
        aria-label="Open notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell size={19} />
        {items.length > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary-500 px-1 text-center text-[9px] font-bold leading-4 text-white">{items.length > 99 ? '99+' : items.length}</span>}
      </button>

      {open && typeof document !== 'undefined' && createPortal((
        <div className="fixed inset-0 z-[100] bg-black/55 sm:flex sm:items-center sm:justify-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false) }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-dialog-title"
            className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl dark:bg-dark-900 sm:h-auto sm:max-h-[min(82vh,760px)] sm:max-w-xl sm:rounded-3xl sm:border sm:border-neutral-200 sm:dark:border-dark-700"
          >
            <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-dark-700 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">Community updates</p>
                <h2 id="notification-dialog-title" className="mt-1 font-serif text-xl font-bold text-neutral-900 dark:text-white">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={loadNotifications} disabled={loading || !user} aria-label="Refresh notifications" className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 dark:hover:bg-dark-700">
                  <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
                </button>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-dark-700">
                  <X size={19} />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
              {!user ? (
                <div className="rounded-2xl bg-neutral-50 p-8 text-center text-sm text-neutral-500 dark:bg-dark-800 dark:text-neutral-400">Sign in to view notifications for your account.</div>
              ) : loading && items.length === 0 ? (
                <div className="flex min-h-44 items-center justify-center gap-2 text-sm text-neutral-500"><Loader2 size={17} className="animate-spin" /> Loading notifications…</div>
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">{error}</div>
              ) : groups.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-neutral-50 px-6 text-center dark:bg-dark-800">
                  <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-900/20"><Bell size={21} /></span>
                  <p className="font-semibold text-neutral-800 dark:text-white">You’re all caught up</p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">New community updates will appear here.</p>
                </div>
              ) : (
                <div className="space-y-7">
                  {groups.map(([month, notifications]) => (
                    <section key={month}>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400"><CalendarDays size={14} />{month}</h3>
                      <div className="space-y-3">
                        {notifications.map((item) => (
                          <article key={item.id} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-dark-700 dark:bg-dark-800">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-serif text-base font-bold leading-snug text-neutral-900 dark:text-white">{item.title}</h4>
                              {item.badge && <span className="shrink-0 rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">{item.badge}</span>}
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{item.description}</p>
                            <p className="mt-3 text-[11px] text-neutral-400">{formatDate(item.createdAt)}</p>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>
            <footer className="border-t border-neutral-200 px-5 py-3 text-center text-[11px] text-neutral-400 dark:border-dark-700 sm:px-6">Updates are posted by the community team.</footer>
          </section>
        </div>
      ), document.body)}
    </>
  )
}

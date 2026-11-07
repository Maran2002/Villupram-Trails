'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Mail, RefreshCw, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { WithPermission } from '@/components/admin/WithPermission'
import apiClient from '@/lib/api'

const PAGE_SIZE = 20

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (requestedPage = page) => {
    setLoading(true)
    try {
      const response = await apiClient.get('/admin/newsletter', {
        params: { page: requestedPage, limit: PAGE_SIZE, search },
      })
      const payload = response.data
      if (!payload.success) throw new Error(payload.error || 'Could not load newsletter emails')
      setSubscribers(payload.data || [])
      setTotal(payload.meta?.total || 0)
    } catch (error) {
      toast.error(error.message || 'Failed to load newsletter emails')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timer = setTimeout(() => load(page), search ? 250 : 0)
    return () => clearTimeout(timer)
  }, [load, page, search])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <WithPermission module="newsletter" action="view">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-serif font-bold text-neutral-900 dark:text-white">
              <Mail className="text-primary-500" /> Newsletter Emails
            </h1>
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Addresses submitted through the public updates form. This list is for admin reference; automated emails are not sent.
            </p>
          </div>
          <button onClick={() => load(page)} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-primary-400 disabled:opacity-50 dark:border-dark-600 dark:text-neutral-200">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </header>

        <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-dark-700 dark:bg-dark-800">
          <div className="relative w-full max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(1) }}
              placeholder="Search email addresses"
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-primary-500 dark:border-dark-600 dark:bg-dark-900 dark:text-white"
            />
          </div>
          <span className="shrink-0 text-sm text-neutral-500 dark:text-neutral-400">{total} email{total === 1 ? '' : 's'}</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-dark-700 dark:bg-dark-800">
          {loading ? (
            <div className="p-10 text-center text-sm text-neutral-500">Loading email list…</div>
          ) : subscribers.length === 0 ? (
            <div className="p-10 text-center text-sm text-neutral-500">{search ? 'No emails match your search.' : 'No newsletter emails have been collected yet.'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500 dark:bg-dark-900">
                  <tr><th className="px-5 py-3 font-semibold">Email address</th><th className="px-5 py-3 font-semibold">Added</th><th className="px-5 py-3 font-semibold">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-dark-700">
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td className="px-5 py-4 font-medium text-neutral-900 dark:text-white">{subscriber.email}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-neutral-600 dark:text-neutral-300">
                        {subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-5 py-4 text-neutral-600 dark:text-neutral-300">{subscriber.status || 'active'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-dark-700">
            <span className="text-xs text-neutral-500">Page {Math.min(page, pageCount)} of {pageCount}</span>
            <div className="flex gap-2">
              <button aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-neutral-200 p-2 text-neutral-600 disabled:opacity-40 dark:border-dark-600 dark:text-neutral-300"><ChevronLeft size={16} /></button>
              <button aria-label="Next page" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-neutral-200 p-2 text-neutral-600 disabled:opacity-40 dark:border-dark-600 dark:text-neutral-300"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </WithPermission>
  )
}

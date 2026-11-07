'use client'

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bell, ChevronLeft, ChevronRight, Edit3, Loader2, Plus, RefreshCw, Search, Send, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import apiClient from '@/lib/api'
import { Perm, WithPermission } from '@/components/admin/WithPermission'

const PAGE_SIZE = 20
const EMPTY_FORM = { title: '', description: '', badge: '', audienceRoles: [] }

function roleLabel(role) {
  return role.slice(0, 1).toUpperCase() + role.slice(1)
}

function formatDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString()
}

export default function AdminNotificationsPage() {
  const [items, setItems] = useState([])
  const [roles, setRoles] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = useCallback(async (requestedPage = page) => {
    setLoading(true)
    try {
      const response = await apiClient.get('/admin/notifications', {
        params: { page: requestedPage, search },
      })
      const payload = response.data
      if (!payload.success) throw new Error(payload.error || 'Could not load notifications')
      setItems(Array.isArray(payload.data) ? payload.data : [])
      setTotal(payload.meta?.total || 0)
      setRoles(Array.isArray(payload.meta?.roles) ? payload.meta.roles : [])
    } catch (error) {
      toast.error(error.message || 'Could not load notifications')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    const timer = setTimeout(() => load(page), search ? 250 : 0)
    return () => clearTimeout(timer)
  }, [load, page, search])

  useEffect(() => {
    if (!formOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previousOverflow }
  }, [formOpen])

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, audienceRoles: [...roles] })
    setFormOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({
      title: item.title || '',
      description: item.description || '',
      badge: item.badge || '',
      audienceRoles: Array.isArray(item.audienceRoles) ? item.audienceRoles : [],
    })
    setFormOpen(true)
  }

  const toggleRole = (role) => {
    setForm((current) => ({
      ...current,
      audienceRoles: current.audienceRoles.includes(role)
        ? current.audienceRoles.filter((entry) => entry !== role)
        : [...current.audienceRoles, role],
    }))
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const response = editingId
        ? await apiClient.put(`/admin/notifications/${editingId}`, form)
        : await apiClient.post('/admin/notifications', form)
      if (!response.data.success) throw new Error(response.data.error || 'Could not save notification')
      toast.success(editingId ? 'Notification updated' : 'Notification published')
      setFormOpen(false)
      setPage(1)
      await load(1)
    } catch (error) {
      toast.error(error.message || 'Could not save notification')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (item) => {
    if (!window.confirm(`Delete “${item.title}”? This removes it from users’ notification lists.`)) return
    try {
      const response = await apiClient.delete(`/admin/notifications/${item.id}`)
      if (!response.data.success) throw new Error(response.data.error || 'Could not delete notification')
      toast.success('Notification deleted')
      await load(page)
    } catch (error) {
      toast.error(error.message || 'Could not delete notification')
    }
  }

  return (
    <WithPermission module="notifications" action="view">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 font-serif text-3xl font-bold text-neutral-900 dark:text-white"><Bell className="text-primary-500" /> Notifications</h1>
            <p className="mt-2 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">Create and manage in-app announcements. Publishing displays the update immediately; this does not send email or browser push messages.</p>
          </div>
          <Perm module="notifications" action="add">
            <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600"><Plus size={17} /> New notification</button>
          </Perm>
        </header>

        <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-dark-700 dark:bg-dark-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} placeholder="Search title, description, badge, or role" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-3 text-sm text-neutral-900 outline-none focus:border-primary-500 dark:border-dark-600 dark:bg-dark-900 dark:text-white" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => load(page)} disabled={loading} aria-label="Refresh notifications" className="ml-1 rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-dark-700"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-dark-700 dark:bg-dark-800">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-neutral-500"><Loader2 size={17} className="animate-spin" /> Loading notifications…</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center"><Bell size={27} className="mx-auto mb-3 text-neutral-300" /><p className="font-semibold text-neutral-700 dark:text-neutral-200">{search ? 'No notifications match your search.' : 'No notifications yet.'}</p><p className="mt-1 text-sm text-neutral-500">Published announcements will appear here.</p></div>
          ) : (
            <div className="divide-y divide-neutral-100 dark:divide-dark-700">
              {items.map((item) => (
                <article key={item.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">{item.title}</h2>
                      {item.badge && <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">{item.badge}</span>}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{item.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-400">
                      <span>Published {formatDate(item.createdAt)}</span>
                      {item.updatedAt && new Date(item.updatedAt).getTime() !== new Date(item.createdAt).getTime() && <span>Edited {formatDate(item.updatedAt)}</span>}
                      <span className="flex flex-wrap gap-1">{item.audienceRoles.map((role) => <span key={role} className="rounded-full bg-neutral-100 px-2 py-0.5 text-neutral-600 dark:bg-dark-700 dark:text-neutral-300">{roleLabel(role)}</span>)}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Perm module="notifications" action="edit"><button type="button" onClick={() => openEdit(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-2 text-xs font-semibold text-neutral-700 hover:border-primary-400 hover:text-primary-600 dark:border-dark-600 dark:text-neutral-200"><Edit3 size={14} /> Edit</button></Perm>
                    <Perm module="notifications" action="delete"><button type="button" onClick={() => remove(item)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/20"><Trash2 size={14} /> Delete</button></Perm>
                  </div>
                </article>
              ))}
            </div>
          )}
          <footer className="flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-dark-700">
            <span className="text-xs text-neutral-500">{total} notification{total === 1 ? '' : 's'} · Page {Math.min(page, pageCount)} of {pageCount}</span>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-neutral-200 p-2 text-neutral-600 disabled:opacity-40 dark:border-dark-600 dark:text-neutral-300"><ChevronLeft size={16} /></button>
              <button type="button" aria-label="Next page" disabled={page >= pageCount || loading} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-neutral-200 p-2 text-neutral-600 disabled:opacity-40 dark:border-dark-600 dark:text-neutral-300"><ChevronRight size={16} /></button>
            </div>
          </footer>
        </div>
      </div>

      {formOpen && typeof document !== 'undefined' && createPortal((
        <div className="fixed inset-0 z-[100] bg-black/55 sm:flex sm:items-center sm:justify-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setFormOpen(false) }}>
          <section role="dialog" aria-modal="true" aria-labelledby="notification-form-title" className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white dark:bg-dark-900 sm:h-auto sm:max-h-[90vh] sm:max-w-2xl sm:rounded-3xl sm:border sm:border-neutral-200 sm:shadow-2xl sm:dark:border-dark-700">
            <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-dark-700 sm:px-6">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-500">Manual in-app announcement</p><h2 id="notification-form-title" className="mt-1 font-serif text-xl font-bold text-neutral-900 dark:text-white">{editingId ? 'Edit notification' : 'Publish notification'}</h2></div>
              <button type="button" onClick={() => setFormOpen(false)} disabled={saving} aria-label="Close form" className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 disabled:opacity-40 dark:hover:bg-dark-700"><X size={19} /></button>
            </header>
            <form onSubmit={save} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">Title <span className="text-neutral-400">({form.title.length}/120)</span></span><input required maxLength={120} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="What should people know?" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm outline-none focus:border-primary-500 dark:border-dark-600 dark:bg-dark-800 dark:text-white" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">Description <span className="text-neutral-400">({form.description.length}/2000)</span></span><textarea required maxLength={2000} rows={6} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Write the announcement details" className="w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm leading-relaxed outline-none focus:border-primary-500 dark:border-dark-600 dark:bg-dark-800 dark:text-white" /></label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold text-neutral-700 dark:text-neutral-200">Badge <span className="font-normal text-neutral-400">(optional, up to 32 characters)</span></span><input maxLength={32} value={form.badge} onChange={(event) => setForm((current) => ({ ...current, badge: event.target.value }))} placeholder="For example: Important" className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-3 text-sm outline-none focus:border-primary-500 dark:border-dark-600 dark:bg-dark-800 dark:text-white" /></label>
              <fieldset><legend className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">Audience roles</legend><p className="mb-3 text-xs text-neutral-500">Users with any selected role will see this notification. Choose all roles for a site-wide update.</p>{roles.length === 0 ? <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/20 dark:text-amber-300">No user roles were found.</p> : <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{roles.map((role) => <label key={role} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${form.audienceRoles.includes(role) ? 'border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300' : 'border-neutral-200 text-neutral-600 dark:border-dark-700 dark:text-neutral-300'}`}><input type="checkbox" checked={form.audienceRoles.includes(role)} onChange={() => toggleRole(role)} className="accent-primary-500" />{roleLabel(role)}</label>)}</div>}</fieldset>
              <p className="rounded-xl bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-500 dark:bg-dark-800 dark:text-neutral-400">{editingId ? 'Saving changes updates the current announcement for its audience.' : 'Publishing makes this announcement available immediately in the in-app notification center. No email or browser push is sent.'}</p>
              <div className="flex justify-end gap-3 border-t border-neutral-100 pt-4 dark:border-dark-700"><button type="button" onClick={() => setFormOpen(false)} disabled={saving} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-300 dark:hover:bg-dark-800">Cancel</button><button type="submit" disabled={saving || roles.length === 0 || form.audienceRoles.length === 0} className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50">{saving ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}{editingId ? 'Save changes' : 'Publish now'}</button></div>
            </form>
          </section>
        </div>
      ), document.body)}
    </WithPermission>
  )
}

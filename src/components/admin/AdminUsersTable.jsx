'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store'
import { Shield, Search, RefreshCw, ChevronLeft, ChevronRight, Edit, Trash2, Plus, X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Perm } from './WithPermission'

const MODULES = ['places', 'reviews', 'users', 'audit', 'reports', 'settings', 'contributors', 'logs', 'approvals']

export function AdminUsersTable() {
  const token = useAuthStore((s) => s.token)
  const { user: currentUser } = useAuthStore()
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleTab, setRoleTab] = useState('') // '' | 'admin' | 'user'
  const [page, setPage]     = useState(1)
  const [total, setTotal]   = useState(0)
  const LIMIT = 15

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const load = useCallback(async (p = 1, q = search, r = roleTab) => {
    setLoading(true)
    const t = token || localStorage.getItem('auth_token')
    const params = new URLSearchParams({ page: p, limit: LIMIT })
    if (q) params.set('search', q)
    if (r) params.set('role', r)
    try {
      const res = await fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${t}` } })
      const d = await res.json()
      if (d.success) { setUsers(d.data.users || []); setTotal(d.data.total || 0) }
    } catch { toast.error('Failed to load users') }
    setLoading(false)
  }, [token, search, roleTab])

  useEffect(() => { load(1, '', roleTab) }, [token, roleTab])

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); load(1, search, roleTab) }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const t = token || localStorage.getItem('auth_token')
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${t}` }
      })
      const d = await res.json()
      if (d.success) {
        toast.success('User deleted')
        load(page)
      } else {
        toast.error(d.error || 'Failed to delete')
      }
    } catch (e) {
      toast.error('Error deleting user')
    }
  }

  const pages = Math.ceil(total / LIMIT)

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl border border-neutral-200 dark:border-dark-700 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-4 border-b border-neutral-100 dark:border-dark-700">
        <div className="flex items-center gap-4">
          <div className="flex bg-neutral-100 dark:bg-dark-700 p-1 rounded-xl">
            {[{id: '', label: 'All'}, {id: 'admin', label: 'Admins'}, {id: 'user', label: 'Users'}].map(t => (
              <button key={t.id} onClick={() => setRoleTab(t.id)} className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${roleTab === t.id ? 'bg-white dark:bg-dark-800 text-neutral-900 dark:text-white shadow' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-8 pr-4 py-2 text-sm bg-neutral-50 dark:bg-dark-700 border border-neutral-200 dark:border-dark-600 rounded-xl focus:outline-none focus:border-primary-500 text-neutral-900 dark:text-white w-56"
            />
          </div>
          <button onClick={() => load(page)} className="p-2 rounded-xl text-neutral-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
            <RefreshCw size={14} />
          </button>
          <Perm module="users" action="add">
            <button onClick={() => { setEditingUser(null); setIsModalOpen(true) }} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors">
              <Plus size={16} /> Add New
            </button>
          </Perm>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-neutral-100 dark:border-dark-700 bg-neutral-50 dark:bg-dark-900/40">
              {['User', 'Role', 'Status', 'Joined', ''].map(h => (
                <th key={h} className="px-6 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-dark-700">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-6 py-4">
                  <div className="h-8 bg-neutral-100 dark:bg-dark-700 rounded-xl animate-pulse" />
                </td></tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-400 text-sm">No users found.</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="hover:bg-neutral-50 dark:hover:bg-dark-800/60 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm shrink-0">
                      {u.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                        {u.username}
                        {u.role === 'admin' && <Shield size={11} className="text-primary-500" />}
                      </p>
                      <p className="text-xs text-neutral-400 truncate max-w-[180px]">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    u.role === 'admin'
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'bg-neutral-100 text-neutral-600 dark:bg-dark-700 dark:text-neutral-300'
                  }`}>{u.role || 'user'}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                    u.isVerified
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-neutral-100 text-neutral-500 dark:bg-dark-700 dark:text-neutral-400'
                  }`}>{u.isVerified ? 'Verified' : 'Unverified'}</span>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-400">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u._id !== '6a01cdc39618522cd98e7bbf' && (
                      <>
                        <Perm module="users" action="edit">
                          <button onClick={() => { setEditingUser(u); setIsModalOpen(true) }} className="p-1.5 text-neutral-400 hover:text-primary-500 transition-colors"><Edit size={16}/></button>
                        </Perm>
                        <Perm module="users" action="delete">
                          <button onClick={() => handleDelete(u._id)} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </Perm>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-neutral-100 dark:border-dark-700">
          <p className="text-xs text-neutral-400">{total} users · page {page} of {pages}</p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => { const p = page - 1; setPage(p); load(p) }}
              className="p-2 rounded-lg border border-neutral-200 dark:border-dark-600 disabled:opacity-40 hover:border-primary-400 transition-colors text-neutral-600 dark:text-neutral-400">
              <ChevronLeft size={14} />
            </button>
            <button disabled={page >= pages} onClick={() => { const p = page + 1; setPage(p); load(p) }}
              className="p-2 rounded-lg border border-neutral-200 dark:border-dark-600 disabled:opacity-40 hover:border-primary-400 transition-colors text-neutral-600 dark:text-neutral-400">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <UserModal 
          user={editingUser} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); load(page) }} 
        />
      )}
    </div>
  )
}

function UserModal({ user, onClose, onSuccess }) {
  const token = useAuthStore((s) => s.token)
  const isEdit = !!user

  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'user',
    permissions: user?.permissions || {}
  })

  const [loading, setLoading] = useState(false)

  const handlePermissionChange = (module, action) => {
    setForm(f => ({
      ...f,
      permissions: {
        ...f.permissions,
        [module]: {
          ...(f.permissions[module] || {}),
          [action]: !f.permissions[module]?.[action]
        }
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const t = token || localStorage.getItem('auth_token')
    
    const payload = { ...form }
    if (isEdit && !payload.password) delete payload.password;
    if (payload.role === 'user') delete payload.permissions;

    try {
      const res = await fetch(isEdit ? `/api/admin/users/${user._id}` : '/api/admin/users', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        toast.success(isEdit ? 'User updated' : 'User created')
        onSuccess()
      } else {
        toast.error(data.error || 'Failed to save user')
      }
    } catch (err) {
      toast.error('An error occurred')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-dark-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 dark:border-dark-700">
        <div className="sticky top-0 bg-white dark:bg-dark-800 p-6 border-b border-neutral-100 dark:border-dark-700 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold font-serif dark:text-white">{isEdit ? 'Edit User' : 'Add New User'}</h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase">Username</label>
              <input required value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase">Email</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase">Password {isEdit && '(Leave empty to keep)'}</label>
              <input required={!isEdit} type="password" minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-500 uppercase">Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-dark-600 bg-neutral-50 dark:bg-dark-900 focus:outline-none focus:border-primary-500 text-sm appearance-none">
                <option value="user">Normal User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {form.role === 'admin' && (
            <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-dark-700">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2"><Shield size={16} className="text-primary-500" /> Administrative Permissions</h3>
              <p className="text-xs text-neutral-500">Configure access levels for the admin dashboard modules.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MODULES.map(mod => (
                  <div key={mod} className="bg-neutral-50 dark:bg-dark-900 p-4 rounded-xl border border-neutral-200 dark:border-dark-600">
                    <h4 className="font-bold text-sm mb-3 capitalize text-neutral-800 dark:text-neutral-200">{mod}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {['view', 'add', 'edit', 'delete'].map(action => {
                        const isChecked = !!form.permissions[mod]?.[action]
                        return (
                          <label key={action} className="flex items-center gap-2 cursor-pointer group">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-primary-500 border-primary-500' : 'border-neutral-300 dark:border-dark-500 bg-white dark:bg-dark-800 group-hover:border-primary-400'}`}>
                              {isChecked && <CheckCircle size={12} className="text-white" />}
                            </div>
                            <input type="checkbox" className="hidden" checked={isChecked} onChange={() => handlePermissionChange(mod, action)} />
                            <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">{action}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-neutral-100 dark:border-dark-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-dark-800 -mx-6 -mb-6 p-6">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-dark-700 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-60">
              {loading ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

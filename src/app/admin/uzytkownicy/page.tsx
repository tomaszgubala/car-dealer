'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  phone: string | null
  active: boolean
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'EDITOR',
    phone: '',
    active: true,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
    setLoading(false)
  }

  function openNew() {
    setEditUser(null)
    setForm({ name: '', email: '', password: '', role: 'EDITOR', phone: '', active: true })
    setError('')
    setShowForm(true)
  }

  function openEdit(user: User) {
    setEditUser(user)
    setForm({ name: user.name || '', email: user.email, password: '', role: user.role, phone: user.phone || '', active: user.active })
    setError('')
    setShowForm(true)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const url = editUser ? `/api/admin/users/${editUser.id}` : '/api/admin/users'
      const method = editUser ? 'PATCH' : 'POST'
      const body: Record<string, unknown> = { name: form.name, email: form.email, role: form.role, phone: form.phone, active: form.active }
      if (form.password) body.password = form.password

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error || 'Błąd serwera')
      }

      setShowForm(false)
      fetchUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Dezaktywować użytkownika?')) return
    await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    fetchUsers()
  }

  const inp = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500'
  const lbl = 'block text-xs font-medium text-gray-500 mb-1'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Użytkownicy</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Dodaj użytkownika
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="font-bold text-gray-900">{editUser ? 'Edytuj użytkownika' : 'Nowy użytkownik'}</h2>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={lbl}>Imię i nazwisko</label>
                <input type="text" className={inp} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Email *</label>
                <input type="email" className={inp} value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required />
              </div>
              <div className="col-span-2">
                <label className={lbl}>{editUser ? 'Nowe hasło (zostaw puste by nie zmieniać)' : 'Hasło *'}</label>
                <input type="password" className={inp} value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} />
              </div>
              <div className="col-span-2">
                <label className={lbl}>Telefon</label>
                <input type="tel" className={inp} value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+48 32 508 80 00" />
              </div>
              <div>
                <label className={lbl}>Rola</label>
                <select className={inp + ' bg-white'} value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
                  <option value="ADMIN">ADMIN</option>
                  <option value="EDITOR">EDITOR</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </div>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({...f, active: e.target.checked}))} className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Aktywny</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Zapisz
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Użytkownik</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Telefon</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Rola</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-400">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <div className="font-medium text-gray-900">{user.name || '—'}</div>
                    <div className="text-gray-400 text-xs">{user.email}</div>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{user.phone || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.role === 'ADMIN' ? 'bg-blue-50 text-blue-700' :
                      user.role === 'EDITOR' ? 'bg-green-50 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${user.active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {user.active ? 'Aktywny' : 'Nieaktywny'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(user)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

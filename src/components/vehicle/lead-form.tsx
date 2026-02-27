'use client'

import { useState, useRef } from 'react'
import { Phone, Mail, CalendarCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeadFormProps {
  vehicleId: string
  vehicleTitle: string
  dealerPhone?: string
  dealerEmail?: string
  contactName?: string
}

export function LeadForm({ vehicleId, vehicleTitle, dealerPhone, dealerEmail, contactName }: LeadFormProps) {
  const [type, setType] = useState<'inquiry' | 'test_drive'>('inquiry')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const honeypot = fd.get('website')
    if (honeypot) { setLoading(false); return } // spam

    const data = {
      vehicleId,
      type,
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      message: fd.get('message'),
      honeypot,
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error || 'Błąd serwera')
      }
      setSuccess(true)
      formRef.current?.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-semibold text-green-800">Wiadomość wysłana!</p>
        <p className="text-sm text-green-600 mt-1">Skontaktujemy się wkrótce.</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm text-green-700 underline"
        >
          Wyślij kolejne zapytanie
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
      <h3 className="font-semibold text-gray-900 text-lg">Zapytaj o pojazd</h3>

      {/* Quick CTA buttons */}
      <div className="flex flex-col gap-2">
        {dealerPhone && (
          <a
            href={`tel:${dealerPhone}`}
            onClick={() => trackCTA(vehicleId, 'call')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
          >
            <Phone className="w-4 h-4" />
            {contactName ? `${contactName}: ` : ''}{dealerPhone}
          </a>
        )}
        {dealerEmail && (
          <a
            href={`mailto:${dealerEmail}?subject=Zapytanie: ${encodeURIComponent(vehicleTitle)}`}
            onClick={() => trackCTA(vehicleId, 'email')}
            className="flex items-center justify-center gap-2 w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Napisz maila
          </a>
        )}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-100" />
        </div>
        <div className="relative flex justify-center text-xs text-gray-400 bg-white px-3">
          lub zostaw wiadomość
        </div>
      </div>

      {/* Form type tabs */}
      <div className="flex rounded-xl bg-gray-50 p-1 gap-1">
        {[
          { value: 'inquiry', label: 'Zapytanie', icon: Mail },
          { value: 'test_drive', label: 'Jazda próbna', icon: CalendarCheck },
        ].map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value as typeof type)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-all',
              type === value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
        {/* Honeypot (hidden) */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          aria-hidden="true"
          className="hidden"
          autoComplete="off"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Imię *</label>
            <input
              type="text"
              name="name"
              required
              maxLength={100}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Telefon</label>
            <input
              type="tel"
              name="phone"
              maxLength={20}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Email *</label>
          <input
            type="email"
            name="email"
            required
            maxLength={200}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Wiadomość</label>
          <textarea
            name="message"
            rows={3}
            maxLength={2000}
            placeholder={type === 'test_drive' ? 'Preferowany termin jazdy próbnej...' : 'Treść wiadomości...'}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Wysyłanie...' : type === 'test_drive' ? 'Umów jazdę próbną' : 'Wyślij zapytanie'}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Twoje dane są bezpieczne i nie będą udostępniane.
        </p>
      </form>
    </div>
  )
}

async function trackCTA(vehicleId: string, type: 'call' | 'email') {
  try {
    await fetch('/api/stats/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: type === 'call' ? 'CTA_CALL' : 'CTA_EMAIL', vehicleId }),
    })
  } catch {}
}

export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getClientIp, hashIp } from '@/lib/utils'

const schema = z.object({
  vehicleId: z.string().optional(),
  type: z.enum(['inquiry', 'test_drive']),
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  phone: z.string().max(20).optional(),
  message: z.string().max(2000).optional(),
  honeypot: z.string().optional(),
})

const rateLimit = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const key = hashIp(ip)
  const entry = rateLimit.get(key)
  if (!entry || entry.reset < now) {
    rateLimit.set(key, { count: 1, reset: now + 3600_000 })
    return true
  }
  if (entry.count >= 5) return false
  entry.count++
  return true
}

export async function POST(req: Request) {
  const ip = getClientIp(req)

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Zbyt wiele zapytań. Spróbuj za godzinę.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Nieprawidłowe dane', details: parsed.error.flatten() }, { status: 400 })
  }

  const { honeypot, ...data } = parsed.data

  if (honeypot) {
    return NextResponse.json({ ok: true })
  }

  try {
    // Pobierz dane kontaktowe z ogłoszenia
    let contactEmail: string | null = null
    let contactPhone: string | null = null
    let contactName: string | null = null

    if (data.vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: data.vehicleId },
        select: { contactEmail: true, contactPhone: true, contactName: true },
      })
      contactEmail = vehicle?.contactEmail || null
      contactPhone = vehicle?.contactPhone || null
      contactName = vehicle?.contactName || null
    }

    const lead = await prisma.lead.create({
      data: {
        vehicleId: data.vehicleId || null,
        type: data.type,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        message: data.message || null,
        ipHash: hashIp(ip),
        userAgent: req.headers.get('user-agent')?.slice(0, 200) || null,
      },
    })

    await prisma.event.create({
      data: {
        type: 'CTA_FORM',
        vehicleId: data.vehicleId || null,
        ipHash: hashIp(ip),
      },
    })

    // Wyślij na email handlowca z ogłoszenia LUB globalny DEALER_EMAIL
    if (process.env.RESEND_API_KEY) {
      sendLeadEmail(lead.id, data, {
        contactEmail,
        contactPhone,
        contactName,
      }).catch(console.error)
    }

    return NextResponse.json({ ok: true, id: lead.id })
  } catch (err) {
    console.error('[API leads]', err)
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 })
  }
}

async function sendLeadEmail(
  leadId: string,
  data: { type: string; name: string; email: string; phone?: string; message?: string; vehicleId?: string },
  contact: { contactEmail: string | null; contactPhone: string | null; contactName: string | null }
) {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Wyślij na email handlowca jeśli ustawiony, w przeciwnym razie na globalny
  const toEmail = contact.contactEmail || process.env.DEALER_EMAIL || 'kontakt@dealer.pl'

  const typeLabel = data.type === 'test_drive' ? 'Jazda próbna' : 'Zapytanie o pojazd'

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@dealer.pl',
    to: toEmail,
    replyTo: data.email,
    subject: `${typeLabel} od ${data.name}`,
    text: [
      `Typ: ${typeLabel}`,
      ``,
      `--- Dane klienta ---`,
      `Imię: ${data.name}`,
      `Email: ${data.email}`,
      `Telefon: ${data.phone || '—'}`,
      `Wiadomość: ${data.message || '—'}`,
      ``,
      `--- Ogłoszenie ---`,
      `ID pojazdu: ${data.vehicleId || '—'}`,
      contact.contactName ? `Handlowiec: ${contact.contactName}` : '',
      ``,
      `Lead ID: ${leadId}`,
    ].filter(Boolean).join('\n'),
  })
}

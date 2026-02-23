export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { cacheDel } from '@/lib/redis'
import { makeVehicleSlug } from '@/lib/utils'

const schema = z.object({
  type: z.enum(['NEW', 'USED']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'RESERVED', 'SOLD']).default('ACTIVE'),
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  trim: z.string().max(200).optional().nullable(),
  year: z.number().int().min(1900).max(2030),
  mileage: z.number().int().min(0).optional().nullable(),
  fuel: z.string().max(50).optional().nullable(),
  gearbox: z.string().max(50).optional().nullable(),
  bodyType: z.string().max(50).optional().nullable(),
  drive: z.string().max(50).optional().nullable(),
  powerHP: z.number().int().min(1).max(2000).optional().nullable(),
  engineCC: z.number().optional().nullable(),
  color: z.string().max(50).optional().nullable(),
  priceGross: z.number().min(0),
  currency: z.enum(['PLN', 'EUR']).default('PLN'),
  installmentAmount: z.number().optional().nullable(),
  installmentTermMonths: z.number().int().optional().nullable(),
  installmentDownPayment: z.number().optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  descriptionPL: z.string().max(10000).optional().nullable(),
  descriptionEN: z.string().max(10000).optional().nullable(),
  images: z.array(z.string()).max(30).default([]),
  videos: z.array(z.string()).max(5).default([]),
  features: z.array(z.string()).max(100).default([]),
  promoted: z.boolean().default(false),
})

async function checkAuth() {
  const session = await auth()
  if (!session?.user) return null
  if (!['ADMIN', 'EDITOR'].includes(session.user.role)) return null
  return session
}

export async function POST(req: Request) {
  const session = await checkAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 })

  const d = parsed.data
  const id = Math.random().toString(36).slice(2, 8)
  const slug = makeVehicleSlug(d.type, d.make, d.model, d.year, id)

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        slug,
        source: 'manual',
        ...d,
        hasEN: !!d.descriptionEN,
        publishedAt: d.status === 'ACTIVE' ? new Date() : null,
      },
    })

    await prisma.auditLog.create({
      data: { userId: session.user.id, vehicleId: vehicle.id, action: 'CREATE' },
    })

    await cacheDel('listing:*')

    return NextResponse.json({ ok: true, id: vehicle.id, slug: vehicle.slug })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Duplicate slug' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

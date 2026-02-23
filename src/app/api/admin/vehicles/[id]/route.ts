import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { cacheDel } from '@/lib/redis'

const patchSchema = z.object({
  type: z.enum(['NEW', 'USED']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'RESERVED', 'SOLD']).optional(),
  make: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  trim: z.string().max(200).nullable().optional(),
  year: z.number().int().min(1900).max(2030).optional(),
  mileage: z.number().int().min(0).nullable().optional(),
  fuel: z.string().max(50).nullable().optional(),
  gearbox: z.string().max(50).nullable().optional(),
  bodyType: z.string().max(50).nullable().optional(),
  drive: z.string().max(50).nullable().optional(),
  powerHP: z.number().int().nullable().optional(),
  engineCC: z.number().nullable().optional(),
  color: z.string().max(50).nullable().optional(),
  priceGross: z.number().min(0).optional(),
  currency: z.enum(['PLN', 'EUR']).optional(),
  installmentAmount: z.number().nullable().optional(),
  installmentTermMonths: z.number().int().nullable().optional(),
  installmentDownPayment: z.number().nullable().optional(),
  location: z.string().max(100).nullable().optional(),
  descriptionPL: z.string().max(10000).nullable().optional(),
  descriptionEN: z.string().max(10000).nullable().optional(),
  images: z.array(z.string()).max(30).optional(),
  videos: z.array(z.string()).max(5).optional(),
  features: z.array(z.string()).max(100).optional(),
  promoted: z.boolean().optional(),
})

interface Params { params: { id: string } }

async function checkAuth() {
  const session = await auth()
  if (!session?.user) return null
  if (!['ADMIN', 'EDITOR'].includes(session.user.role)) return null
  return session
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await checkAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Validation error', details: parsed.error.flatten() }, { status: 400 })

  const existing = await prisma.vehicle.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const d = parsed.data
  const update = {
    ...d,
    hasEN: d.descriptionEN !== undefined ? !!d.descriptionEN : existing.hasEN,
    ...(d.status === 'ACTIVE' && !existing.publishedAt ? { publishedAt: new Date() } : {}),
  }

  await prisma.vehicle.update({ where: { id: params.id }, data: update })

  await prisma.auditLog.create({
    data: { userId: session.user.id, vehicleId: params.id, action: 'UPDATE', meta: Object.keys(d) },
  })

  await cacheDel(`vehicle:${existing.slug}`)
  await cacheDel('listing:*')

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const existing = await prisma.vehicle.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Soft delete — just set status to INACTIVE
  await prisma.vehicle.update({ where: { id: params.id }, data: { status: 'INACTIVE' } })

  await prisma.auditLog.create({
    data: { userId: session.user.id, vehicleId: params.id, action: 'DELETE_SOFT' },
  })

  await cacheDel(`vehicle:${existing.slug}`)
  await cacheDel('listing:*')

  return NextResponse.json({ ok: true })
}

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getClientIp, hashIp } from '@/lib/utils'

const schema = z.object({
  type: z.enum(['PAGE_VIEW', 'LISTING_VIEW', 'VEHICLE_VIEW', 'CTA_CALL', 'CTA_EMAIL', 'CTA_FORM', 'SHARE']),
  vehicleId: z.string().optional(),
})

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }) }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false })

  const ip = getClientIp(req)

  try {
    await prisma.event.create({
      data: {
        type: parsed.data.type,
        vehicleId: parsed.data.vehicleId || null,
        ipHash: hashIp(ip),
        userAgent: req.headers.get('user-agent')?.slice(0, 200) || null,
        referer: req.headers.get('referer')?.slice(0, 500) || null,
      },
    })
  } catch {
    // Non-critical, ignore
  }

  return NextResponse.json({ ok: true })
}

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000,
    include: { vehicle: { select: { make: true, model: true, slug: true } } },
  })

  const rows = [
    ['Data', 'Typ', 'Imię', 'Email', 'Telefon', 'Pojazd', 'Wiadomość'].join(','),
    ...leads.map(l => [
      l.createdAt.toISOString(),
      l.type,
      `"${l.name.replace(/"/g, '""')}"`,
      l.email,
      l.phone || '',
      l.vehicle ? `${l.vehicle.make} ${l.vehicle.model}` : '',
      `"${(l.message || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    ].join(',')),
  ].join('\n')

  return new Response(rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, phone: true, active: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  if (!body.email || !body.password) {
    return NextResponse.json({ error: 'Email i hasło są wymagane' }, { status: 400 })
  }

  const hash = await bcrypt.hash(body.password, 12)

  const user = await prisma.user.create({
    data: {
      name: body.name || null,
      email: body.email,
      password: hash,
      role: body.role || 'EDITOR',
      phone: body.phone || null,
      active: body.active ?? true,
      emailVerified: new Date(),
    },
  })

  return NextResponse.json(user)
}

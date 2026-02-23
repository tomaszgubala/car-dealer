import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { runImport } from '@/lib/connectors/registry'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { connector } = await req.json().catch(() => ({}))

  try {
    const results = await runImport(connector)
    return NextResponse.json({ ok: true, results })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

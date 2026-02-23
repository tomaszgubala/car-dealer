export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { runImport } from '@/lib/connectors/registry'

// This endpoint is called by Vercel Cron or external cron
// Secured by IMPORT_SECRET_TOKEN or Vercel Cron auth
export async function GET(req: Request) {
  // Verify token
  const authHeader = req.headers.get('authorization')
  const cronToken = process.env.IMPORT_SECRET_TOKEN

  const isVercelCron = req.headers.get('x-vercel-cron-signature') !== null
  const hasValidToken = cronToken && authHeader === `Bearer ${cronToken}`

  if (!isVercelCron && !hasValidToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await runImport()
    return NextResponse.json({ ok: true, results })
  } catch (err) {
    console.error('[Import cron]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

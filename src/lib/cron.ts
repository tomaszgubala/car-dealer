// This file is executed in a separate process or in Next.js instrumentation hook
// For Vercel: use Vercel Cron Jobs (vercel.json) + GET /api/import/cron
// For VPS/Docker: use node-cron here

import cron from 'node-cron'
import { runImport } from './connectors/registry'

let isRunning = false

export function startCron() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  // Run every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    if (isRunning) {
      console.log('[Import] Skipping: previous run still in progress')
      return
    }
    isRunning = true
    try {
      console.log('[Import] Starting scheduled import...')
      const results = await runImport()
      for (const r of results) {
        console.log(`[Import] ${r.connector}: +${r.newCount} new, ~${r.updatedCount} updated, ${r.errorCount} errors`)
      }
    } catch (err) {
      console.error('[Import] Fatal error:', err)
    } finally {
      isRunning = false
    }
  })

  console.log('[Import] Cron scheduler started (every 30 min)')
}

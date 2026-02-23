import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Statystyki' }

async function getStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000)

  const [eventTotals, topVehicles, recentLeads, dailyRaw] = await Promise.all([
    prisma.event.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
    prisma.event.groupBy({
      by: ['vehicleId'],
      _count: { id: true },
      where: { type: 'VEHICLE_VIEW', vehicleId: { not: null }, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { vehicle: { select: { make: true, model: true, slug: true, type: true } } },
    }),
    // Simplified: just get events grouped (PostgreSQL specific would be better, but using Prisma findMany)
    prisma.event.findMany({
      where: { type: 'VEHICLE_VIEW', createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
  ])

  // Process daily views
  const dailyMap = new Map<string, number>()
  for (const e of dailyRaw) {
    const d = e.createdAt.toISOString().slice(0, 10)
    dailyMap.set(d, (dailyMap.get(d) || 0) + 1)
  }
  const dailyViews = Array.from(dailyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  // Get vehicle details for top vehicles
  const vehicleIds = topVehicles.map(v => v.vehicleId!).filter(Boolean)
  const vehicleDetails = await prisma.vehicle.findMany({
    where: { id: { in: vehicleIds } },
    select: { id: true, make: true, model: true, slug: true, type: true },
  })
  const vehicleMap = Object.fromEntries(vehicleDetails.map(v => [v.id, v]))

  return {
    eventTotals: Object.fromEntries(eventTotals.map(e => [e.type, e._count.id])),
    topVehicles: topVehicles.map(v => ({
      ...vehicleMap[v.vehicleId!],
      views: v._count.id,
    })).filter(v => v.make),
    recentLeads,
    dailyViews,
  }
}

export default async function StatsPage() {
  const stats = await getStats()

  const eventLabels: Record<string, string> = {
    VEHICLE_VIEW: 'Odsłony aut',
    CTA_CALL: '📞 Zadzwoń',
    CTA_EMAIL: '✉️ Email',
    CTA_FORM: '📋 Formularze',
    SHARE: '🔗 Udostępnienia',
    LISTING_VIEW: 'Listing',
  }

  const maxDaily = Math.max(...stats.dailyViews.map(d => d.count), 1)

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Statystyki</h1>
        <a href="/api/admin/stats/export" className="text-sm text-primary-600 hover:underline">
          Eksport CSV →
        </a>
      </div>

      {/* Kluczowe metryki */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Object.entries(eventLabels).map(([type, label]) => (
          <div key={type} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <div className="text-xl font-bold text-gray-900">
              {(stats.eventTotals[type] || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Daily views mini bar chart */}
      {stats.dailyViews.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Odsłony dziennie — ostatnie 30 dni</h2>
          <div className="flex items-end gap-0.5 h-24">
            {stats.dailyViews.map((d) => (
              <div
                key={d.date}
                className="flex-1 bg-primary-200 hover:bg-primary-500 transition-colors rounded-t"
                style={{ height: `${(d.count / maxDaily) * 100}%` }}
                title={`${d.date}: ${d.count} odsłon`}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-300 mt-1">
            <span>{stats.dailyViews[0]?.date}</span>
            <span>{stats.dailyViews[stats.dailyViews.length - 1]?.date}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top vehicles */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Top 10 pojazdów (odsłony, 30 dni)</h2>
          {stats.topVehicles.length === 0 ? (
            <p className="text-sm text-gray-400">Brak danych</p>
          ) : (
            <ol className="space-y-2">
              {stats.topVehicles.map((v, i) => (
                <li key={v.id || i} className="flex items-center gap-3 text-sm">
                  <span className="text-gray-300 font-medium w-5 text-right">{i + 1}</span>
                  <div className="flex-1">
                    <a
                      href={`/${v.type === 'NEW' ? 'nowe' : 'uzywane'}/${v.slug}`}
                      target="_blank"
                      className="font-medium text-gray-900 hover:text-primary-600"
                    >
                      {v.make} {v.model}
                    </a>
                  </div>
                  <span className="text-gray-500 font-medium">{v.views}</span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Recent leads */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Ostatnie zapytania</h2>
          {stats.recentLeads.length === 0 ? (
            <p className="text-sm text-gray-400">Brak zapytań</p>
          ) : (
            <div className="space-y-2">
              {stats.recentLeads.map((lead) => (
                <div key={lead.id} className="flex gap-3 items-start text-sm py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-gray-400 truncate">{lead.email}</div>
                    {lead.vehicle && (
                      <div className="text-xs text-primary-600">
                        {lead.vehicle.make} {lead.vehicle.model}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      lead.type === 'test_drive' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {lead.type === 'test_drive' ? 'Jazda' : 'Zapytanie'}
                    </span>
                    <div className="text-xs text-gray-300 mt-1">
                      {lead.createdAt.toLocaleDateString('pl-PL')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

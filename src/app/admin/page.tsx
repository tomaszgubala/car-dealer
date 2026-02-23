import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Car, Eye, MessageSquare, TrendingUp, Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

async function getStats() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000)

  const [
    totalVehicles,
    activeVehicles,
    newCount,
    usedCount,
    totalViews,
    weekViews,
    totalLeads,
    recentLeads,
    recentImports,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: 'ACTIVE' } }),
    prisma.vehicle.count({ where: { type: 'NEW', status: 'ACTIVE' } }),
    prisma.vehicle.count({ where: { type: 'USED', status: 'ACTIVE' } }),
    prisma.event.count({ where: { type: 'VEHICLE_VIEW' } }),
    prisma.event.count({ where: { type: 'VEHICLE_VIEW', createdAt: { gte: sevenDaysAgo } } }),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.importJob.findMany({ orderBy: { createdAt: 'desc' }, take: 3 }),
  ])

  return { totalVehicles, activeVehicles, newCount, usedCount, totalViews, weekViews, totalLeads, recentLeads, recentImports }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const statCards = [
    { label: 'Aktywne ogłoszenia', value: stats.activeVehicles, sub: `${stats.newCount} nowe, ${stats.usedCount} używane`, icon: Car, color: 'text-primary-600 bg-primary-50' },
    { label: 'Odsłony (7 dni)', value: stats.weekViews, sub: `${stats.totalViews} łącznie`, icon: Eye, color: 'text-green-600 bg-green-50' },
    { label: 'Zapytania (7 dni)', value: stats.recentLeads, sub: `${stats.totalLeads} łącznie`, icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
    { label: 'Wszystkie pojazdy', value: stats.totalVehicles, sub: 'w bazie danych', icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/admin/pojazdy/nowy"
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Dodaj ogłoszenie
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className={`inline-flex p-2.5 rounded-xl mb-3 ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}</div>
              <div className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent imports */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Ostatnie importy</h2>
            <Link href="/admin/import" className="text-sm text-primary-600 hover:underline">
              Zarządzaj →
            </Link>
          </div>
          {stats.recentImports.length === 0 ? (
            <p className="text-sm text-gray-400">Brak importów</p>
          ) : (
            <div className="space-y-3">
              {stats.recentImports.map((imp) => (
                <div key={imp.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-900">{imp.connector}</span>
                    <span className="text-gray-400 ml-2">
                      +{imp.newCount} nowe · ~{imp.updatedCount} zaktualizowane
                    </span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    imp.status === 'SUCCESS' ? 'bg-green-50 text-green-700' :
                    imp.status === 'FAILED' ? 'bg-red-50 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {imp.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Szybkie akcje</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/pojazdy/nowy', label: '+ Dodaj pojazd' },
              { href: '/admin/pojazdy?status=INACTIVE', label: '⚠️ Nieaktywne ogłoszenia' },
              { href: '/admin/statystyki', label: '📊 Pełne statystyki' },
              { href: '/admin/import', label: '🔄 Uruchom import' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

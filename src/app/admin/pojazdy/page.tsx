import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'
import { formatPrice, formatMileage } from '@/lib/utils'
import { auth } from '@/lib/auth'

export const metadata: Metadata = { title: 'Pojazdy' }

interface PageProps {
  searchParams: { page?: string; status?: string; q?: string }
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: 'Aktywny', cls: 'bg-green-50 text-green-700' },
  INACTIVE: { label: 'Nieaktywny', cls: 'bg-gray-100 text-gray-600' },
  RESERVED: { label: 'Zarezerwowany', cls: 'bg-amber-50 text-amber-700' },
  SOLD: { label: 'Sprzedany', cls: 'bg-red-50 text-red-700' },
}

export default async function AdminVehiclesPage({ searchParams }: PageProps) {
  const session = await auth()
  const page = Math.max(1, parseInt(searchParams.page || '1'))
  const limit = 20
  const skip = (page - 1) * limit

  const where = {
    ...(searchParams.status ? { status: searchParams.status as 'ACTIVE' | 'INACTIVE' } : {}),
    ...(searchParams.q ? {
      OR: [
        { make: { contains: searchParams.q, mode: 'insensitive' as const } },
        { model: { contains: searchParams.q, mode: 'insensitive' as const } },
      ],
    } : {}),
  }

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: [{ promoted: 'desc' }, { updatedAt: 'desc' }],
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        type: true,
        make: true,
        model: true,
        trim: true,
        year: true,
        mileage: true,
        priceGross: true,
        currency: true,
        status: true,
        promoted: true,
        source: true,
        publishedAt: true,
      },
    }),
    prisma.vehicle.count({ where }),
  ])

  const pages = Math.ceil(total / limit)
  const canEdit = session?.user.role === 'ADMIN' || session?.user.role === 'EDITOR'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pojazdy</h1>
          <p className="text-sm text-gray-400">{total} ogłoszeń w bazie</p>
        </div>
        {canEdit && (
          <Link
            href="/admin/pojazdy/nowy"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Dodaj
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['', 'ACTIVE', 'INACTIVE', 'RESERVED', 'SOLD'].map((s) => (
          <Link
            key={s}
            href={`/admin/pojazdy${s ? `?status=${s}` : ''}`}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              (searchParams.status || '') === s
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s || 'Wszystkie'}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Pojazd</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Typ</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Cena</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Źródło</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {vehicles.map((v) => {
                const status = STATUS_LABELS[v.status] || { label: v.status, cls: 'bg-gray-100 text-gray-600' }
                return (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {v.make} {v.model}
                        {v.trim && <span className="text-gray-500 font-normal"> {v.trim}</span>}
                      </div>
                      <div className="text-xs text-gray-400">
                        {v.year} · {formatMileage(v.mileage)} 
                        {v.promoted && ' · ⭐ Wyróżnione'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${v.type === 'NEW' ? 'bg-primary-50 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                        {v.type === 'NEW' ? 'Nowe' : 'Używane'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatPrice(v.priceGross, v.currency as 'PLN' | 'EUR')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{v.source}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/${v.type === 'NEW' ? 'nowe' : 'uzywane'}/${v.slug}`}
                          target="_blank"
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Podgląd"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {canEdit && (
                          <Link
                            href={`/admin/pojazdy/${v.id}`}
                            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edytuj"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 text-sm text-gray-500">
            <span>Strona {page} z {pages} · {total} rekordów</span>
            <div className="flex gap-1">
              {page > 1 && (
                <Link href={`/admin/pojazdy?page=${page - 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
                  className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">
                  ← Poprz.
                </Link>
              )}
              {page < pages && (
                <Link href={`/admin/pojazdy?page=${page + 1}${searchParams.status ? `&status=${searchParams.status}` : ''}`}
                  className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Nast. →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

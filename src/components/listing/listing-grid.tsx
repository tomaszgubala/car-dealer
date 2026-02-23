'use client'

import { useState } from 'react'
import { VehicleCard } from './vehicle-card'
import { ListingFilters } from './filters'
import { SegmentControl } from '@/components/ui/toggle'
import type { VehicleListItem, PaginatedResult } from '@/types'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ListingGridProps {
  initialData: PaginatedResult<VehicleListItem>
  filterOptions: Awaited<ReturnType<typeof import('@/lib/vehicles').getFilterOptions>>
  type: string
  newCount: number
  usedCount: number
}

export function ListingGrid({ initialData, filterOptions, type, newCount, usedCount }: ListingGridProps) {
  const [showInstallment, setShowInstallment] = useState(false)
  const [onlyEN, setOnlyEN] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleTypeChange = (newType: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('type', newType)
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(page))
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleOnlyEN = (val: boolean) => {
    setOnlyEN(val)
    const params = new URLSearchParams(searchParams.toString())
    if (val) params.set('onlyEN', '1')
    else params.delete('onlyEN')
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  const { data: vehicles, total, page, pages } = initialData

  return (
    <div className="space-y-6">
      {/* Type segment control */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SegmentControl
          value={type}
          options={[
            { value: 'USED', label: 'Używane', count: usedCount },
            { value: 'NEW', label: 'Nowe', count: newCount },
          ]}
          onChange={handleTypeChange}
        />
      </div>

      {/* Filters */}
      <ListingFilters
        options={filterOptions}
        showInstallment={showInstallment}
        onInstallmentChange={setShowInstallment}
        onlyEN={onlyEN}
        onOnlyENChange={handleOnlyEN}
        totalCount={total}
      />

      {/* Grid */}
      {vehicles.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-lg font-medium text-gray-600">Brak wyników</p>
          <p className="text-sm mt-1">Zmień kryteria wyszukiwania</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v, i) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              showInstallment={showInstallment}
              priority={i < 6}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
            const p = pages <= 7 ? i + 1 : i === 0 ? 1 : i === 6 ? pages : page - 2 + i
            return (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? 'bg-primary-600 text-white'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            )
          })}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= pages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

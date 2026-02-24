import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getVehicles, getFilterOptions } from '@/lib/vehicles'
import { prisma } from '@/lib/prisma'
import { ListingGrid } from '@/components/listing/listing-grid'
import type { ListingFilters, VehicleType } from '@/types'

export const metadata: Metadata = {
  title: "L'EMIR — Samochody nowe i używane",
  description: "Sprawdź ofertę L'EMIR — samochody nowe i używane. Filtry, zdjęcia, ceny, raty. Szybko, prosto, bez waty.",
}

// ISR: revalidate every 60 seconds
export const revalidate = 60

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>
}

function parseFilters(searchParams: PageProps['searchParams']): ListingFilters {
  const get = (k: string) => {
    const v = searchParams[k]
    return typeof v === 'string' ? v : Array.isArray(v) ? v[0] : undefined
  }
  const getAll = (k: string) => {
    const v = searchParams[k]
    if (!v) return undefined
    const arr = Array.isArray(v) ? v : [v]
    return arr.length ? arr : undefined
  }
  const getNum = (k: string) => {
    const v = get(k)
    const n = v ? parseInt(v) : undefined
    return n && !isNaN(n) ? n : undefined
  }

  return {
    type: (get('type') as VehicleType) || 'USED',
    make: getAll('make'),
    model: getAll('model'),
    fuel: getAll('fuel'),
    gearbox: getAll('gearbox'),
    bodyType: getAll('bodyType'),
    drive: getAll('drive'),
    location: getAll('location'),
    yearFrom: getNum('yearFrom'),
    yearTo: getNum('yearTo'),
    mileageFrom: getNum('mileageFrom'),
    mileageTo: getNum('mileageTo'),
    priceFrom: getNum('priceFrom'),
    priceTo: getNum('priceTo'),
    onlyEN: get('onlyEN') === '1',
    q: get('q'),
    sort: (get('sort') as ListingFilters['sort']) || 'newest',
    page: getNum('page') || 1,
    limit: 24,
  }
}

export default async function HomePage({ searchParams }: PageProps) {
  const filters = parseFilters(searchParams)

  const [result, filterOptions, newCount, usedCount] = await Promise.all([
    getVehicles(filters),
    getFilterOptions(),
    prisma.vehicle.count({ where: { type: 'NEW', status: 'ACTIVE' } }),
    prisma.vehicle.count({ where: { type: 'USED', status: 'ACTIVE' } }),
  ])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero text - minimal */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {filters.type === 'NEW' ? 'Samochody nowe' : 'Samochody używane'}
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Certyfikowany dealer · Gwarancja jakości</p>
      </div>

      <Suspense>
        <ListingGrid
          initialData={result}
          filterOptions={filterOptions}
          type={filters.type || 'USED'}
          newCount={newCount}
          usedCount={usedCount}
        />
      </Suspense>
    </div>
  )
}

export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { getVehicles } from '@/lib/vehicles'
import type { ListingFilters, VehicleType } from '@/types'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const get = (k: string) => searchParams.get(k) || undefined
  const getNum = (k: string) => {
    const v = get(k)
    const n = v ? parseInt(v) : undefined
    return n && !isNaN(n) ? n : undefined
  }
  const getAll = (k: string) => {
    const vals = searchParams.getAll(k)
    return vals.length ? vals : undefined
  }

  const filters: ListingFilters = {
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
    limit: Math.min(48, getNum('limit') || 24),
  }

  try {
    const result = await getVehicles(filters)
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch (err) {
    console.error('[API vehicles]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

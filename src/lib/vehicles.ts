import { prisma } from '@/lib/prisma'
import { cacheGet, cacheSet } from '@/lib/redis'
import type { ListingFilters, PaginatedResult, VehicleListItem, VehicleDetail } from '@/types'
import { Prisma } from '@prisma/client'

function buildWhere(filters: ListingFilters): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {}

  if (filters.type) where.type = filters.type
  where.status = 'ACTIVE'

  if (filters.make?.length) where.make = { in: filters.make }
  if (filters.model?.length) where.model = { in: filters.model }
  if (filters.fuel?.length) where.fuel = { in: filters.fuel }
  if (filters.gearbox?.length) where.gearbox = { in: filters.gearbox }
  if (filters.bodyType?.length) where.bodyType = { in: filters.bodyType }
  if (filters.drive?.length) where.drive = { in: filters.drive }
  if (filters.location?.length) where.location = { in: filters.location }
  if (filters.onlyEN) where.hasEN = true

  if (filters.yearFrom || filters.yearTo) {
    where.year = {
      ...(filters.yearFrom ? { gte: filters.yearFrom } : {}),
      ...(filters.yearTo ? { lte: filters.yearTo } : {}),
    }
  }
  if (filters.mileageFrom !== undefined || filters.mileageTo !== undefined) {
    where.mileage = {
      ...(filters.mileageFrom !== undefined ? { gte: filters.mileageFrom } : {}),
      ...(filters.mileageTo !== undefined ? { lte: filters.mileageTo } : {}),
    }
  }
  if (filters.priceFrom !== undefined || filters.priceTo !== undefined) {
    where.priceGross = {
      ...(filters.priceFrom !== undefined ? { gte: filters.priceFrom } : {}),
      ...(filters.priceTo !== undefined ? { lte: filters.priceTo } : {}),
    }
  }

  if (filters.q) {
    const q = filters.q.trim()
    where.OR = [
      { make: { contains: q, mode: 'insensitive' } },
      { model: { contains: q, mode: 'insensitive' } },
      { trim: { contains: q, mode: 'insensitive' } },
      { vin: { contains: q, mode: 'insensitive' } },
      { descriptionPL: { contains: q, mode: 'insensitive' } },
    ]
  }

  return where
}

function buildOrderBy(sort?: string): Prisma.VehicleOrderByWithRelationInput[] {
  switch (sort) {
    case 'cheapest':
      return [{ promoted: 'desc' }, { priceGross: 'asc' }]
    case 'expensive':
      return [{ promoted: 'desc' }, { priceGross: 'desc' }]
    case 'low_mileage':
      return [{ promoted: 'desc' }, { mileage: 'asc' }]
    case 'year_desc':
      return [{ promoted: 'desc' }, { year: 'desc' }]
    case 'promoted':
      return [{ promoted: 'desc' }, { publishedAt: 'desc' }]
    default:
      return [{ promoted: 'desc' }, { publishedAt: 'desc' }]
  }
}

const listSelect = {
  id: true,
  slug: true,
  type: true,
  status: true,
  make: true,
  model: true,
  trim: true,
  year: true,
  mileage: true,
  fuel: true,
  gearbox: true,
  bodyType: true,
  powerHP: true,
  color: true,
  priceGross: true,
  currency: true,
  installmentAmount: true,
  installmentTermMonths: true,
  location: true,
  images: true,
  promoted: true,
  hasEN: true,
  publishedAt: true,
} satisfies Prisma.VehicleSelect

export async function getVehicles(
  filters: ListingFilters
): Promise<PaginatedResult<VehicleListItem>> {
  const page = Math.max(1, filters.page || 1)
  const limit = Math.min(50, filters.limit || 24)
  const skip = (page - 1) * limit

  const cacheKey = `listing:${JSON.stringify({ ...filters, page, limit })}`
  const cached = await cacheGet<PaginatedResult<VehicleListItem>>(cacheKey)
  if (cached) return cached

  const where = buildWhere(filters)
  const orderBy = buildOrderBy(filters.sort)

  const [data, total] = await Promise.all([
    prisma.vehicle.findMany({ where, select: listSelect, orderBy, skip, take: limit }),
    prisma.vehicle.count({ where }),
  ])

  const result: PaginatedResult<VehicleListItem> = {
    data: data.map((v) => ({
      ...v,
      currency: v.currency as 'PLN' | 'EUR',
      publishedAt: v.publishedAt?.toISOString() || null,
    })),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  }

  await cacheSet(cacheKey, result, 60)
  return result
}

export async function getVehicleBySlug(slug: string): Promise<VehicleDetail | null> {
  const cacheKey = `vehicle:${slug}`
  const cached = await cacheGet<VehicleDetail>(cacheKey)
  if (cached) return cached

  const v = await prisma.vehicle.findUnique({
    where: { slug, status: 'ACTIVE' },
  })

  if (!v) return null

  const detail: VehicleDetail = {
    id: v.id,
    slug: v.slug,
    type: v.type as 'NEW' | 'USED',
    status: v.status as 'ACTIVE' | 'INACTIVE' | 'RESERVED' | 'SOLD',
    make: v.make,
    model: v.model,
    trim: v.trim,
    year: v.year,
    mileage: v.mileage,
    fuel: v.fuel,
    gearbox: v.gearbox,
    bodyType: v.bodyType,
    drive: v.drive,
    powerHP: v.powerHP,
    engineCC: v.engineCC,
    color: v.color,
    doors: v.doors,
    seats: v.seats,
    vin: v.vin,
    priceGross: v.priceGross,
    currency: v.currency as 'PLN' | 'EUR',
    installmentAmount: v.installmentAmount,
    installmentTermMonths: v.installmentTermMonths,
    installmentDownPayment: v.installmentDownPayment,
    installmentBalloon: v.installmentBalloon,
    location: v.location,
    descriptionPL: v.descriptionPL,
    descriptionEN: v.descriptionEN,
    hasEN: v.hasEN,
    features: v.features,
    equipment: v.equipment as Record<string, unknown> | null,
    images: v.images,
    videos: v.videos,
    promoted: v.promoted,
    promotedUntil: v.promotedUntil?.toISOString() || null,
    publishedAt: v.publishedAt?.toISOString() || null,
    updatedAt: v.updatedAt.toISOString(),
  }

  await cacheSet(cacheKey, detail, 120)
  return detail
}

export async function getSimilarVehicles(
  vehicleId: string,
  make: string,
  type: string,
  limit = 6
): Promise<VehicleListItem[]> {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      id: { not: vehicleId },
      make,
      type: type as 'NEW' | 'USED',
      status: 'ACTIVE',
    },
    select: listSelect,
    orderBy: [{ promoted: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
  })

  if (vehicles.length < 3) {
    const more = await prisma.vehicle.findMany({
      where: { id: { not: vehicleId }, type: type as 'NEW' | 'USED', status: 'ACTIVE' },
      select: listSelect,
      orderBy: [{ promoted: 'desc' }, { publishedAt: 'desc' }],
      take: limit,
    })
    return more.map((v) => ({
      ...v,
      currency: v.currency as 'PLN' | 'EUR',
      publishedAt: v.publishedAt?.toISOString() || null,
    }))
  }

  return vehicles.map((v) => ({
    ...v,
    currency: v.currency as 'PLN' | 'EUR',
    publishedAt: v.publishedAt?.toISOString() || null,
  }))
}

export async function getFilterOptions() {
  const cacheKey = 'filters:options'
  const cached = await cacheGet<ReturnType<typeof buildFilterOptions>>(cacheKey)
  if (cached) return cached

  const result = await buildFilterOptions()
  await cacheSet(cacheKey, result, 300)
  return result
}

async function buildFilterOptions() {
  const [makes, fuels, gearboxes, bodyTypes, drives, locations] = await Promise.all([
    prisma.vehicle.findMany({
      where: { status: 'ACTIVE' },
      select: { make: true, model: true },
      distinct: ['make', 'model'],
    }),
    prisma.vehicle.groupBy({ by: ['fuel'], where: { status: 'ACTIVE', fuel: { not: null } } }),
    prisma.vehicle.groupBy({ by: ['gearbox'], where: { status: 'ACTIVE', gearbox: { not: null } } }),
    prisma.vehicle.groupBy({ by: ['bodyType'], where: { status: 'ACTIVE', bodyType: { not: null } } }),
    prisma.vehicle.groupBy({ by: ['drive'], where: { status: 'ACTIVE', drive: { not: null } } }),
    prisma.vehicle.groupBy({ by: ['location'], where: { status: 'ACTIVE', location: { not: null } } }),
  ])

  const makeMap: Record<string, string[]> = {}
  for (const { make, model } of makes) {
    if (!makeMap[make]) makeMap[make] = []
    if (!makeMap[make].includes(model)) makeMap[make].push(model)
  }

  return {
    makes: Object.keys(makeMap).sort(),
    makeModels: makeMap,
    fuels: fuels.map((f) => f.fuel!).filter(Boolean).sort(),
    gearboxes: gearboxes.map((g) => g.gearbox!).filter(Boolean).sort(),
    bodyTypes: bodyTypes.map((b) => b.bodyType!).filter(Boolean).sort(),
    drives: drives.map((d) => d.drive!).filter(Boolean).sort(),
    locations: locations.map((l) => l.location!).filter(Boolean).sort(),
  }
}

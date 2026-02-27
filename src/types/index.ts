export type VehicleType = 'NEW' | 'USED'
export type VehicleStatus = 'ACTIVE' | 'INACTIVE' | 'RESERVED' | 'SOLD'
export type Currency = 'PLN' | 'EUR'

export interface VehicleListItem {
  id: string
  slug: string
  type: VehicleType
  status: VehicleStatus
  make: string
  model: string
  trim: string | null
  year: number
  mileage: number | null
  fuel: string | null
  gearbox: string | null
  bodyType: string | null
  powerHP: number | null
  color: string | null
  priceGross: number
  currency: Currency
  installmentAmount: number | null
  installmentTermMonths: number | null
  location: string | null
  images: string[]
  promoted: boolean
  hasEN: boolean
  publishedAt: string | null
}

export interface VehicleDetail extends VehicleListItem {
  drive: string | null
  engineCC: number | null
  doors: number | null
  seats: number | null
  vin: string | null
  installmentDownPayment: number | null
  installmentBalloon: number | null
  descriptionPL: string | null
  descriptionEN: string | null
  features: string[]
  equipment: Record<string, unknown> | null
  videos: string[]
  promotedUntil: string | null
  updatedAt: string
  contactPhone: string | null
  contactEmail: string | null
  contactName: string | null
  specificationUrl: string | null
}

export interface ListingFilters {
  type?: VehicleType
  make?: string[]
  model?: string[]
  yearFrom?: number
  yearTo?: number
  mileageFrom?: number
  mileageTo?: number
  priceFrom?: number
  priceTo?: number
  fuel?: string[]
  gearbox?: string[]
  bodyType?: string[]
  drive?: string[]
  location?: string[]
  onlyEN?: boolean
  q?: string
  sort?: SortOption
  page?: number
  limit?: number
}

export type SortOption =
  | 'newest'
  | 'cheapest'
  | 'expensive'
  | 'low_mileage'
  | 'year_desc'
  | 'promoted'

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface DealerStats {
  totalVehicles: number
  activeVehicles: number
  newVehicles: number
  usedVehicles: number
  totalViews: number
  totalLeads: number
  recentViews: Array<{ date: string; count: number }>
  topVehicles: Array<{ slug: string; make: string; model: string; views: number }>
  conversionRate: number
}

export interface LeadFormData {
  name: string
  email: string
  phone?: string
  message?: string
  type: 'inquiry' | 'test_drive'
  honeypot?: string
}

export interface ConnectorVehicle {
  externalId: string
  type: VehicleType
  make: string
  model: string
  trim?: string
  year: number
  mileage?: number
  fuel?: string
  gearbox?: string
  bodyType?: string
  drive?: string
  powerHP?: number
  engineCC?: number
  color?: string
  priceGross: number
  currency?: Currency
  installmentAmount?: number
  location?: string
  descriptionPL?: string
  descriptionEN?: string
  images?: string[]
  videos?: string[]
  features?: string[]
}

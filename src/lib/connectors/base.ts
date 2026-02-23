import type { ConnectorVehicle } from '@/types'
import { z } from 'zod'

export interface ConnectorResult {
  vehicles: ConnectorVehicle[]
  errors: string[]
}

export interface Connector {
  name: string
  fetch(): Promise<ConnectorResult>
}

// ─── Validation schema ────────────────────────────────────────────────────────

export const ConnectorVehicleSchema = z.object({
  externalId: z.string().min(1),
  type: z.enum(['NEW', 'USED']),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 2),
  mileage: z.number().int().min(0).optional(),
  fuel: z.string().optional(),
  gearbox: z.string().optional(),
  bodyType: z.string().optional(),
  drive: z.string().optional(),
  powerHP: z.number().int().min(1).max(2000).optional(),
  engineCC: z.number().int().optional(),
  color: z.string().optional(),
  priceGross: z.number().min(0),
  currency: z.enum(['PLN', 'EUR']).optional(),
  installmentAmount: z.number().optional(),
  location: z.string().optional(),
  descriptionPL: z.string().max(10000).optional(),
  descriptionEN: z.string().max(10000).optional(),
  images: z.array(z.string().url()).max(30).optional(),
  videos: z.array(z.string()).max(5).optional(),
  features: z.array(z.string()).max(100).optional(),
})

export function validateConnectorVehicle(data: unknown): { data: ConnectorVehicle; error: null } | { data: null; error: string } {
  const result = ConnectorVehicleSchema.safeParse(data)
  if (result.success) return { data: result.data as ConnectorVehicle, error: null }
  return { data: null, error: result.error.message }
}

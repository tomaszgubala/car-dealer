/**
 * SampleExternalAPI Connector
 *
 * HOW TO ADD A NEW CONNECTOR:
 * 1. Create a new file in src/lib/connectors/
 * 2. Implement the Connector interface
 * 3. Map your external data to ConnectorVehicle using validateConnectorVehicle()
 * 4. Register it in src/lib/connectors/registry.ts
 * 5. The import system handles dedup, upsert, and logging automatically
 */

import type { Connector, ConnectorResult } from './base'
import type { ConnectorVehicle } from '@/types'
import { validateConnectorVehicle } from './base'

// Mock external API response shape (replace with your actual API)
interface ExternalVehicle {
  id: string
  vehicle_type: 'new' | 'used'
  brand: string
  car_model: string
  version?: string
  production_year: number
  odometer_km?: number
  engine_type: string
  transmission: string
  body: string
  hp?: number
  cc?: number
  selling_price: number
  monthly_payment?: number
  depot: string
  description?: string
  photo_urls: string[]
}

// Fuel mapping from external API to our format
const fuelMap: Record<string, string> = {
  petrol: 'Benzyna',
  diesel: 'Diesel',
  hybrid: 'Hybryda',
  phev: 'Hybryda plug-in',
  electric: 'Elektryczny',
  lpg: 'LPG',
}

const gearboxMap: Record<string, string> = {
  manual: 'Manualna',
  automatic: 'Automatyczna',
  dct: 'Automatyczna',
  cvt: 'CVT',
}

const bodyMap: Record<string, string> = {
  sedan: 'Sedan',
  hatchback: 'Hatchback',
  estate: 'Kombi',
  suv: 'SUV',
  coupe: 'Coupe',
  van: 'Van',
  cabrio: 'Cabrio',
}

export class SampleExternalAPIConnector implements Connector {
  name = 'SampleExternalAPI'

  private baseUrl = process.env.SAMPLE_API_URL || 'https://api.example-dealer.com'
  private apiKey = process.env.SAMPLE_API_KEY || ''

  async fetch(): Promise<ConnectorResult> {
    const vehicles: ConnectorVehicle[] = []
    const errors: string[] = []

    try {
      // In production: fetch from real API with auth
      // const response = await fetch(`${this.baseUrl}/vehicles`, {
      //   headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Accept': 'application/json' },
      //   signal: AbortSignal.timeout(30000),
      // })
      // const rawData: ExternalVehicle[] = await response.json()

      // Mock data for demo
      const rawData: ExternalVehicle[] = getMockData()

      for (const item of rawData) {
        const mapped = this.mapVehicle(item)
        const { data, error } = validateConnectorVehicle(mapped)

        if (error) {
          errors.push(`[${item.id}] ${error}`)
          continue
        }

        if (data) vehicles.push(data)
      }
    } catch (err) {
      errors.push(`Fetch error: ${err instanceof Error ? err.message : String(err)}`)
    }

    return { vehicles, errors }
  }

  private mapVehicle(item: ExternalVehicle) {
    return {
      externalId: item.id,
      type: item.vehicle_type === 'new' ? ('NEW' as const) : ('USED' as const),
      make: item.brand,
      model: item.car_model,
      trim: item.version,
      year: item.production_year,
      mileage: item.odometer_km,
      fuel: fuelMap[item.engine_type] || item.engine_type,
      gearbox: gearboxMap[item.transmission] || item.transmission,
      bodyType: bodyMap[item.body] || item.body,
      powerHP: item.hp,
      engineCC: item.cc,
      priceGross: item.selling_price,
      currency: 'PLN' as const,
      installmentAmount: item.monthly_payment,
      location: item.depot,
      descriptionPL: item.description,
      images: item.photo_urls,
    }
  }
}

function getMockData(): ExternalVehicle[] {
  return [
    {
      id: 'EXT-001',
      vehicle_type: 'used',
      brand: 'BMW',
      car_model: '7 Series',
      version: '740d xDrive',
      production_year: 2021,
      odometer_km: 52000,
      engine_type: 'diesel',
      transmission: 'automatic',
      body: 'sedan',
      hp: 286,
      cc: 2993,
      selling_price: 399000,
      monthly_payment: 4190,
      depot: 'Warszawa',
      description: 'BMW serii 7 w pełnym wyposażeniu Executive. Stan idealny.',
      photo_urls: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800'],
    },
    {
      id: 'EXT-002',
      vehicle_type: 'new',
      brand: 'Mercedes-Benz',
      car_model: 'E-Class',
      version: 'E300e AMG Line',
      production_year: 2024,
      odometer_km: 0,
      engine_type: 'phev',
      transmission: 'automatic',
      body: 'sedan',
      hp: 320,
      cc: 1999,
      selling_price: 329000,
      monthly_payment: 3490,
      depot: 'Kraków',
      description: 'Nowy Mercedes E300e AMG Line. Plug-in hybrid, zasięg elektryczny 50km.',
      photo_urls: ['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
    },
  ]
}

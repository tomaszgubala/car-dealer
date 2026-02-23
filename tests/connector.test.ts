import { describe, it, expect } from 'vitest'
import { validateConnectorVehicle } from '../src/lib/connectors/base'

describe('validateConnectorVehicle', () => {
  const valid = {
    externalId: 'EXT-001',
    type: 'USED' as const,
    make: 'BMW',
    model: '5 Series',
    year: 2021,
    priceGross: 199000,
  }

  it('accepts valid vehicle', () => {
    const { data, error } = validateConnectorVehicle(valid)
    expect(error).toBeNull()
    expect(data?.make).toBe('BMW')
    expect(data?.type).toBe('USED')
  })

  it('rejects missing required fields', () => {
    const { data, error } = validateConnectorVehicle({ externalId: 'x' })
    expect(error).not.toBeNull()
    expect(data).toBeNull()
  })

  it('rejects invalid year', () => {
    const { data, error } = validateConnectorVehicle({ ...valid, year: 1800 })
    expect(error).not.toBeNull()
    expect(data).toBeNull()
  })

  it('rejects invalid type', () => {
    const { data, error } = validateConnectorVehicle({ ...valid, type: 'BROKEN' })
    expect(error).not.toBeNull()
  })

  it('accepts optional fields', () => {
    const { data, error } = validateConnectorVehicle({
      ...valid,
      mileage: 45000,
      fuel: 'Diesel',
      images: ['https://example.com/photo.jpg'],
      features: ['Navigation', 'Leather'],
    })
    expect(error).toBeNull()
    expect(data?.mileage).toBe(45000)
    expect(data?.features).toHaveLength(2)
  })

  it('rejects images with invalid URL', () => {
    const { data, error } = validateConnectorVehicle({
      ...valid,
      images: ['not-a-url'],
    })
    expect(error).not.toBeNull()
  })
})

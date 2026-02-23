import type { VehicleDetail } from '@/types'

interface Props {
  vehicle: VehicleDetail
}

export function StructuredDataVehicle({ vehicle: v }: Props) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${v.make} ${v.model}${v.trim ? ' ' + v.trim : ''}`,
    description: v.descriptionPL || v.descriptionEN || '',
    brand: { '@type': 'Brand', name: v.make },
    model: v.model,
    vehicleModelDate: String(v.year),
    mileageFromOdometer: v.mileage
      ? { '@type': 'QuantitativeValue', value: v.mileage, unitCode: 'KMT' }
      : undefined,
    fuelType: v.fuel || undefined,
    vehicleTransmission: v.gearbox || undefined,
    bodyType: v.bodyType || undefined,
    driveWheelConfiguration: v.drive || undefined,
    color: v.color || undefined,
    vehicleIdentificationNumber: v.vin || undefined,
    image: v.images,
    offers: {
      '@type': 'Offer',
      priceCurrency: v.currency,
      price: v.priceGross,
      availability:
        v.status === 'ACTIVE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'AutoDealer',
        name: 'AutoDealer',
        address: {
          '@type': 'PostalAddress',
          addressLocality: v.location || 'Warszawa',
          addressCountry: 'PL',
        },
      },
    },
    itemCondition:
      v.type === 'NEW'
        ? 'https://schema.org/NewCondition'
        : 'https://schema.org/UsedCondition',
  }

  // Clean undefined values
  const clean = JSON.parse(JSON.stringify(data))

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(clean) }}
    />
  )
}

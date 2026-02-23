'use client'

import Link from 'next/link'
import Image from 'next/image'
import { cn, formatPrice, formatMileage, formatPower } from '@/lib/utils'
import type { VehicleListItem } from '@/types'
import { MapPin, Fuel, Settings2, Gauge, Star } from 'lucide-react'

interface VehicleCardProps {
  vehicle: VehicleListItem
  showInstallment: boolean
  priority?: boolean
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  RESERVED: { label: 'Zarezerwowane', cls: 'bg-amber-100 text-amber-800' },
  SOLD: { label: 'Sprzedane', cls: 'bg-red-100 text-red-800' },
}

const FUEL_SHORT: Record<string, string> = {
  'Benzyna': 'Benz.',
  'Diesel': 'Diesel',
  'Hybryda': 'Hybr.',
  'Hybryda plug-in': 'PHEV',
  'Elektryczny': 'EV',
  'LPG': 'LPG',
}

export function VehicleCard({ vehicle: v, showInstallment, priority }: VehicleCardProps) {
  const href = `/${v.type === 'NEW' ? 'nowe' : 'uzywane'}/${v.slug}`
  const img = v.images?.[0]
  const statusBadge = STATUS_BADGE[v.status]

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200',
        v.status !== 'ACTIVE' && 'opacity-80'
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {img ? (
          <Image
            src={img}
            alt={`${v.make} ${v.model} ${v.year}`}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l2-5h14l2 5M3 9v9a1 1 0 001 1h1m14-10v9a1 1 0 01-1 1h-1m-14 0h14M7 13h10M9 17h6" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {v.promoted && (
            <span className="inline-flex items-center gap-0.5 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              <Star className="w-2.5 h-2.5" />
              Wyróżnione
            </span>
          )}
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded-full',
            v.type === 'NEW' ? 'bg-primary-600 text-white' : 'bg-gray-800 text-white'
          )}>
            {v.type === 'NEW' ? 'Nowe' : 'Używane'}
          </span>
          {statusBadge && (
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', statusBadge.cls)}>
              {statusBadge.label}
            </span>
          )}
        </div>

        {v.hasEN && (
          <div className="absolute top-2 right-2">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-bold px-1.5 py-0.5 rounded">
              EN
            </span>
          </div>
        )}

        {/* Image count */}
        {v.images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
            {v.images.length} zdjęć
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base leading-tight">
            {v.make} {v.model}
            {v.trim && <span className="font-normal text-gray-500 text-sm ml-1">{v.trim}</span>}
          </h3>

          {/* Specs row */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-gray-500">
            <span className="font-medium text-gray-700">{v.year}</span>
            {v.mileage !== null && <span>{formatMileage(v.mileage)}</span>}
            {v.fuel && <span>{FUEL_SHORT[v.fuel] || v.fuel}</span>}
            {v.gearbox && <span>{v.gearbox === 'Automatyczna' ? 'Automat' : v.gearbox === 'Manualna' ? 'Manualna' : v.gearbox}</span>}
            {v.powerHP && <span>{formatPower(v.powerHP)}</span>}
          </div>

          {v.location && (
            <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              {v.location}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mt-3 pt-3 border-t border-gray-50">
          {showInstallment && v.installmentAmount ? (
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Rata od</div>
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(v.installmentAmount)} / mies.
              </div>
              {v.installmentTermMonths && (
                <div className="text-xs text-gray-400">przez {v.installmentTermMonths} mies.</div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(v.priceGross, v.currency)}
              </div>
              {v.installmentAmount && (
                <div className="text-xs text-gray-400">
                  lub od {formatPrice(v.installmentAmount)} / mies.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

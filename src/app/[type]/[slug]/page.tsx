import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getVehicleBySlug, getSimilarVehicles } from '@/lib/vehicles'
import { VehicleGallery } from '@/components/vehicle/gallery'
import { LeadForm } from '@/components/vehicle/lead-form'
import { VehicleCard } from '@/components/listing/vehicle-card'
import { formatPrice, formatMileage, formatPower } from '@/lib/utils'
import { MapPin, Share2, Printer } from 'lucide-react'
import { ShareButton } from '@/components/vehicle/share-button'
import { TrackView } from '@/components/vehicle/track-view'
import { StructuredDataVehicle } from '@/components/seo/structured-data'

interface PageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const v = await getVehicleBySlug(params.slug)
  if (!v) return { title: 'Nie znaleziono' }

  const title = `${v.make} ${v.model}${v.trim ? ' ' + v.trim : ''} ${v.year} — ${formatPrice(v.priceGross, v.currency)}`
  const desc = `${v.make} ${v.model} ${v.year}${v.mileage ? ', ' + formatMileage(v.mileage) : ''}${v.fuel ? ', ' + v.fuel : ''}. ${v.descriptionPL?.slice(0, 120) || ''}`

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: v.images[0] ? [{ url: v.images[0], width: 1200, height: 630 }] : [],
      type: 'article',
    },
    alternates: {
      canonical: `/${v.type === 'NEW' ? 'nowe' : 'uzywane'}/${v.slug}`,
    },
  }
}

const SPEC_LABELS: Array<{ key: string; label: string; format?: (v: unknown) => string }> = [
  { key: 'year', label: 'Rocznik' },
  { key: 'mileage', label: 'Przebieg', format: (v) => formatMileage(v as number) },
  { key: 'fuel', label: 'Paliwo' },
  { key: 'gearbox', label: 'Skrzynia biegów' },
  { key: 'bodyType', label: 'Nadwozie' },
  { key: 'drive', label: 'Napęd' },
  { key: 'powerHP', label: 'Moc', format: (v) => formatPower(v as number) },
  { key: 'engineCC', label: 'Pojemność', format: (v) => `${v} cm³` },
  { key: 'color', label: 'Kolor' },
  { key: 'doors', label: 'Drzwi' },
  { key: 'seats', label: 'Miejsca' },
  { key: 'vin', label: 'VIN' },
]

export const revalidate = 120

export default async function VehiclePage({ params }: PageProps) {
  const v = await getVehicleBySlug(params.slug)
  if (!v) notFound()

  const similar = await getSimilarVehicles(v.id, v.make, v.type)
  const title = `${v.make} ${v.model}${v.trim ? ' ' + v.trim : ''} (${v.year})`
  const dealerPhone = v.contactPhone || process.env.DEALER_PHONE || ''
  const dealerEmail = v.contactEmail || process.env.DEALER_EMAIL || ''

  return (
    <>
      <StructuredDataVehicle vehicle={v} />
      <TrackView vehicleId={v.id} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-5 flex gap-1.5 flex-wrap">
          <a href="/" className="hover:text-gray-600">Oferta</a>
          <span>/</span>
          <a href={`/?type=${v.type}`} className="hover:text-gray-600">
            {v.type === 'NEW' ? 'Nowe' : 'Używane'}
          </a>
          <span>/</span>
          <a href={`/?type=${v.type}&make=${v.make}`} className="hover:text-gray-600">{v.make}</a>
          <span>/</span>
          <span className="text-gray-700">{v.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left column */}
          <div className="space-y-6">
            {/* Gallery */}
            <VehicleGallery images={v.images} videos={v.videos} alt={title} />

            {/* Title + price (mobile only above fold) */}
            <div className="lg:hidden">
              <VehicleTitle vehicle={v} />
            </div>

            {/* Specs table */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Dane techniczne</h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
                {SPEC_LABELS.map(({ key, label, format }) => {
                  const val = (v as unknown as Record<string, unknown>)[key]
                  if (!val) return null
                  return (
                    <div key={key}>
                      <dt className="text-xs text-gray-400 uppercase tracking-wide">{label}</dt>
                      <dd className="font-medium text-gray-900 mt-0.5">
                        {format ? format(val) : String(val)}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>

            {/* Features */}
            {v.features.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Wyposażenie</h2>
                <div className="flex flex-wrap gap-2">
                  {v.features.map((f) => (
                    <span key={f} className="text-sm bg-gray-50 text-gray-700 border border-gray-100 px-3 py-1 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}


            {/* Specification PDF */}
            {v.specificationUrl && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Specyfikacja techniczna</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={v.specificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 18h12V6l-4-4H4v16zm8-14l2 2h-2V4z"/></svg>
                    Podgląd specyfikacji
                  </a>
                  <a
                    href={v.specificationUrl}
                    download
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Pobierz PDF
                  </a>
                </div>
              </div>
            )}

            {/* Descriptions */}
            {(v.descriptionPL || v.descriptionEN) && (
              <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
                <h2 className="font-semibold text-gray-900">Opis</h2>
                {v.descriptionPL && (
                  <div>
                    {v.hasEN && <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 block">PL</span>}
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{v.descriptionPL}</p>
                  </div>
                )}
                {v.hasEN && v.descriptionEN && (
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1 block">EN</span>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{v.descriptionEN}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column — sticky sidebar */}
          <div className="space-y-4">
            <div className="lg:sticky lg:top-20 space-y-4">
              {/* Title + price (desktop) */}
              <div className="hidden lg:block">
                <VehicleTitle vehicle={v} />
              </div>

              {/* Lead form */}
              <LeadForm
                vehicleId={v.id}
                vehicleTitle={title}
                dealerPhone={dealerPhone}
                dealerEmail={dealerEmail}
                contactName={v.contactName || undefined}
              />

              {/* Share */}
              <div className="flex gap-2">
                <ShareButton title={title} />
              </div>
            </div>
          </div>
        </div>

        {/* Similar vehicles */}
        {similar.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Podobne pojazdy</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {similar.slice(0, 3).map((sv) => (
                <VehicleCard key={sv.id} vehicle={sv} showInstallment={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function VehicleTitle({ vehicle: v }: { vehicle: Awaited<ReturnType<typeof getVehicleBySlug>> }) {
  if (!v) return null
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${v.type === 'NEW' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'}`}>
          {v.type === 'NEW' ? 'Nowe' : 'Używane'}
        </span>
        {v.promoted && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            ⭐ Wyróżnione
          </span>
        )}
        {v.hasEN && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
            EN
          </span>
        )}
      </div>

      <h1 className="text-xl font-bold text-gray-900">
        {v.make} {v.model}
        {v.trim && <span className="font-normal text-gray-500"> {v.trim}</span>}
      </h1>

      {v.location && (
        <div className="flex items-center gap-1 text-sm text-gray-400 mt-1">
          <MapPin className="w-3.5 h-3.5" />
          {v.location}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-50">
        <div className="text-2xl font-bold text-gray-900">
          {formatPrice(v.priceGross, v.currency)}
        </div>
        {v.installmentAmount && (
          <div className="text-sm text-gray-500 mt-1">
            lub od {formatPrice(v.installmentAmount)} / mies.
            {v.installmentTermMonths && ` · ${v.installmentTermMonths} mies.`}
          </div>
        )}
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { VehicleForm } from '@/components/admin/vehicle-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface PageProps { params: { id: string } }

export const metadata: Metadata = { title: 'Edytuj ogłoszenie' }

export default async function EditVehiclePage({ params }: PageProps) {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: params.id } })
  if (!vehicle) notFound()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pojazdy" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ChevronLeft className="w-4 h-4" />
          Pojazdy
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edytuj: {vehicle.make} {vehicle.model}
        </h1>
      </div>
      <VehicleForm
        initialData={{
          id: vehicle.id,
          type: vehicle.type,
          status: vehicle.status,
          make: vehicle.make,
          model: vehicle.model,
          trim: vehicle.trim || undefined,
          year: vehicle.year,
          mileage: vehicle.mileage,
          fuel: vehicle.fuel,
          gearbox: vehicle.gearbox,
          bodyType: vehicle.bodyType,
          drive: vehicle.drive,
          powerHP: vehicle.powerHP,
          engineCC: vehicle.engineCC,
          color: vehicle.color,
          priceGross: vehicle.priceGross,
          currency: vehicle.currency,
          installmentAmount: vehicle.installmentAmount,
          installmentTermMonths: vehicle.installmentTermMonths,
          installmentDownPayment: vehicle.installmentDownPayment,
          location: vehicle.location,
          descriptionPL: vehicle.descriptionPL,
          descriptionEN: vehicle.descriptionEN,
          images: vehicle.images,
          videos: vehicle.videos,
          features: vehicle.features,
          promoted: vehicle.promoted,
        }}
      />
    </div>
  )
}

import type { Metadata } from 'next'
import { VehicleForm } from '@/components/admin/vehicle-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Nowe ogłoszenie' }

export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pojazdy" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ChevronLeft className="w-4 h-4" />
          Pojazdy
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nowe ogłoszenie</h1>
      </div>
      <VehicleForm />
    </div>
  )
}

import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { VehicleForm } from '@/components/admin/vehicle-form'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Nowe ogłoszenie' }

export default async function NewVehiclePage() {
  const session = await auth()
  let userPhone = null
  let userName = null

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { phone: true, name: true },
    })
    userPhone = user?.phone || null
    userName = user?.name || null
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/pojazdy" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-2">
          <ChevronLeft className="w-4 h-4" />
          Pojazdy
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nowe ogłoszenie</h1>
      </div>
      <VehicleForm userPhone={userPhone} userName={userName} />
    </div>
  )
}

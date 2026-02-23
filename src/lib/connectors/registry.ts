import type { Connector } from './base'
import { SampleExternalAPIConnector } from './sample'
import { prisma } from '@/lib/prisma'
import { cacheDel } from '@/lib/redis'
import { makeVehicleSlug } from '@/lib/utils'

// Register connectors here
const connectors: Connector[] = [
  new SampleExternalAPIConnector(),
  // Add more: new AutoTraderConnector(), new OtomotoConnector(), ...
]

export function getConnectors(): Connector[] {
  return connectors
}

export async function runImport(connectorName?: string): Promise<{
  connector: string
  newCount: number
  updatedCount: number
  errorCount: number
  errors: string[]
  jobId: string
}[]> {
  const toRun = connectorName
    ? connectors.filter((c) => c.name === connectorName)
    : connectors

  const results = []

  for (const connector of toRun) {
    const job = await prisma.importJob.create({
      data: { connector: connector.name, status: 'RUNNING', startedAt: new Date() },
    })

    let newCount = 0
    let updatedCount = 0
    const errors: string[] = []

    try {
      const { vehicles, errors: fetchErrors } = await connector.fetch()
      errors.push(...fetchErrors)

      for (const v of vehicles) {
        try {
          const existing = await prisma.vehicle.findFirst({
            where: { source: connector.name, sourceExternalId: v.externalId },
          })

          if (existing) {
            await prisma.vehicle.update({
              where: { id: existing.id },
              data: {
                make: v.make,
                model: v.model,
                trim: v.trim ?? null,
                year: v.year,
                mileage: v.mileage ?? null,
                fuel: v.fuel ?? null,
                gearbox: v.gearbox ?? null,
                bodyType: v.bodyType ?? null,
                drive: v.drive ?? null,
                powerHP: v.powerHP ?? null,
                engineCC: v.engineCC ?? null,
                color: v.color ?? null,
                priceGross: v.priceGross,
                currency: v.currency ?? 'PLN',
                installmentAmount: v.installmentAmount ?? null,
                location: v.location ?? null,
                descriptionPL: v.descriptionPL ?? null,
                descriptionEN: v.descriptionEN ?? null,
                hasEN: !!v.descriptionEN,
                images: v.images ?? [],
                videos: v.videos ?? [],
                features: v.features ?? [],
                updatedAt: new Date(),
              },
            })
            updatedCount++
          } else {
            const id = Math.random().toString(36).slice(2, 8)
            const slug = makeVehicleSlug(v.type, v.make, v.model, v.year, id)

            await prisma.vehicle.create({
              data: {
                slug,
                source: connector.name,
                sourceExternalId: v.externalId,
                type: v.type,
                make: v.make,
                model: v.model,
                trim: v.trim ?? null,
                year: v.year,
                mileage: v.mileage ?? null,
                fuel: v.fuel ?? null,
                gearbox: v.gearbox ?? null,
                bodyType: v.bodyType ?? null,
                drive: v.drive ?? null,
                powerHP: v.powerHP ?? null,
                engineCC: v.engineCC ?? null,
                color: v.color ?? null,
                priceGross: v.priceGross,
                currency: v.currency ?? 'PLN',
                installmentAmount: v.installmentAmount ?? null,
                location: v.location ?? null,
                descriptionPL: v.descriptionPL ?? null,
                descriptionEN: v.descriptionEN ?? null,
                hasEN: !!v.descriptionEN,
                images: v.images ?? [],
                videos: v.videos ?? [],
                features: v.features ?? [],
                status: 'ACTIVE',
                publishedAt: new Date(),
              },
            })
            newCount++
          }
        } catch (err) {
          errors.push(`[${v.externalId}] DB error: ${err instanceof Error ? err.message : String(err)}`)
        }
      }

      await prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: 'SUCCESS',
          finishedAt: new Date(),
          newCount,
          updatedCount,
          errorCount: errors.length,
          errors: errors.length ? errors : undefined,
        },
      })

      // Invalidate listing cache
      await cacheDel('listing:*')
    } catch (err) {
      errors.push(`Fatal: ${err instanceof Error ? err.message : String(err)}`)
      await prisma.importJob.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
          errorCount: errors.length,
          errors,
        },
      })
    }

    results.push({ connector: connector.name, newCount, updatedCount, errorCount: errors.length, errors, jobId: job.id })
  }

  return results
}

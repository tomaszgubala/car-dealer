import { prisma } from '@/lib/prisma'
import type { MetadataRoute } from 'next'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const vehicles = await prisma.vehicle.findMany({
    where: { status: 'ACTIVE' },
    select: { slug: true, type: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const vehicleUrls = vehicles.map((v) => ({
    url: `${baseUrl}/${v.type === 'NEW' ? 'nowe' : 'uzywane'}/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/?type=NEW`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/?type=USED`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    ...vehicleUrls,
  ]
}

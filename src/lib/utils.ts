import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import crypto from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatMileage(km: number | null): string {
  if (km === null || km === 0) return 'Nowy'
  return new Intl.NumberFormat('pl-PL').format(km) + ' km'
}

export function formatPower(hp: number | null): string {
  if (!hp) return ''
  return `${hp} KM`
}

export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(ip + (process.env.NEXTAUTH_SECRET || '')).digest('hex').slice(0, 16)
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

export function slugify(text: string): string {
  const map: Record<string, string> = { ą:'a',ć:'c',ę:'e',ł:'l',ń:'n',ó:'o',ś:'s',ź:'z',ż:'z' }
  return text
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (c) => map[c] || c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function makeVehicleSlug(type: string, make: string, model: string, year: number, id: string): string {
  return `${slugify(type === 'NEW' ? 'nowe' : 'uzywane')}-${slugify(make)}-${slugify(model)}-${year}-${id.slice(-6)}`
}

export function getVideoEmbed(url: string): { type: 'youtube' | 'vimeo' | 'mp4' | 'unknown'; src: string } | null {
  if (!url) return null

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  if (ytMatch) {
    return { type: 'youtube', src: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` }
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) {
    return { type: 'vimeo', src: `https://player.vimeo.com/video/${vimeoMatch[1]}` }
  }

  // Direct MP4
  if (url.match(/\.(mp4|webm|m3u8)(\?.*)?$/i)) {
    return { type: 'mp4', src: url }
  }

  return { type: 'unknown', src: url }
}

export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

export const FUEL_LABELS: Record<string, string> = {
  'Benzyna': 'Benzyna',
  'Diesel': 'Diesel',
  'Hybryda': 'Hybryda',
  'Hybryda plug-in': 'Plug-in',
  'Elektryczny': 'EV',
  'LPG': 'LPG',
  'CVT': 'CVT',
}

export function getFuelIcon(fuel: string | null): string {
  if (!fuel) return '⛽'
  if (fuel.includes('Elektr')) return '⚡'
  if (fuel.includes('Hybryda')) return '🔋'
  return '⛽'
}

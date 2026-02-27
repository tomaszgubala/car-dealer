/**
 * Przekształca URL Cloudinary żeby automatycznie skalować zdjęcia
 * do optymalnych rozmiarów i konwertować do WebP
 */
export function optimizeCloudinaryUrl(
  url: string,
  width: number,
  height?: number,
  crop: 'fill' | 'fit' | 'limit' = 'fill'
): string {
  if (!url || !url.includes('res.cloudinary.com')) return url

  // Wstaw transformacje przed nazwą pliku
  const uploadIndex = url.indexOf('/upload/')
  if (uploadIndex === -1) return url

  const base = url.slice(0, uploadIndex + 8)
  const rest = url.slice(uploadIndex + 8)

  const transforms = [
    `w_${width}`,
    height ? `h_${height}` : null,
    `c_${crop}`,
    'f_webp',
    'q_auto',
  ].filter(Boolean).join(',')

  return `${base}${transforms}/${rest}`
}

/** Miniatura do kart (400x300) */
export function thumbnailUrl(url: string) {
  return optimizeCloudinaryUrl(url, 400, 300, 'fill')
}

/** Główne zdjęcie galerii (1200x800) */
export function galleryUrl(url: string) {
  return optimizeCloudinaryUrl(url, 1200, 800, 'fit')
}

/** OG image (1200x630) */
export function ogImageUrl(url: string) {
  return optimizeCloudinaryUrl(url, 1200, 630, 'fill')
}

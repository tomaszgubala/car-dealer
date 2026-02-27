'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getVideoEmbed } from '@/lib/utils'
import { galleryUrl, thumbnailUrl } from '@/lib/cloudinary-utils'

interface GalleryProps {
  images: string[]
  videos?: string[]
  alt: string
}

export function VehicleGallery({ images, videos = [], alt }: GalleryProps) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const total = images.length + videos.length
  const allMedia = [
    ...images.map((src) => ({ type: 'image' as const, src })),
    ...videos.map((src) => ({ type: 'video' as const, src })),
  ]

  if (total === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300">
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9l2-5h14l2 5M3 9v9a1 1 0 001 1h1m14-10v9a1 1 0 01-1 1h-1m-14 0h14" />
        </svg>
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c - 1 + total) % total)
  const next = () => setCurrent((c) => (c + 1) % total)

  const item = allMedia[current]

  return (
    <>
      <div className="space-y-2">
        {/* Main display */}
        <div className="relative aspect-[16/9] bg-gray-100 rounded-2xl overflow-hidden group">
          {item.type === 'image' ? (
            <>
              <Image
                src={galleryUrl(item.src)}
                alt={`${alt} - zdjęcie ${current + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
              <button
                onClick={() => setLightbox(true)}
                className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </>
          ) : (
            <VideoEmbed src={item.src} />
          )}

          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                {current + 1} / {total}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {total > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {allMedia.map((m, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all',
                  i === current ? 'border-primary-500' : 'border-transparent opacity-60 hover:opacity-100'
                )}
              >
                {m.type === 'image' ? (
                  <Image src={thumbnailUrl(m.src)} alt="" fill className="object-cover" sizes="64px" />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && item.type === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-5xl w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-[16/9]">
              <Image src={galleryUrl(item.src)} alt={alt} fill className="object-contain" sizes="100vw" />
            </div>
          </div>
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}

function VideoEmbed({ src }: { src: string }) {
  const embed = getVideoEmbed(src)

  if (!embed) return null

  if (embed.type === 'youtube' || embed.type === 'vimeo') {
    return (
      <iframe
        src={embed.src}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Vehicle video"
      />
    )
  }

  if (embed.type === 'mp4') {
    return (
      <video
        src={embed.src}
        className="w-full h-full object-cover"
        controls
        preload="metadata"
      />
    )
  }

  return (
    <a
      href={embed.src}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center w-full h-full text-white text-sm hover:underline"
    >
      Otwórz wideo
    </a>
  )
}

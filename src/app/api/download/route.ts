export const runtime = 'nodejs'

import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  const filename = searchParams.get('filename') || 'specyfikacja.pdf'

  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  // Zezwól tylko na pliki z Cloudinary
  if (!url.startsWith('https://res.cloudinary.com/')) {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
  }

  const response = await fetch(url)
  if (!response.ok) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const buffer = await response.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}

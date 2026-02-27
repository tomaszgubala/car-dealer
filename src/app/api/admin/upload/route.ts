export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file' }, { status: 400 })
  }

  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const url = await new Promise<string>((resolve, reject) => {
    const options = isPdf
      ? { folder: 'lemir-specs', resource_type: 'raw' as const, format: 'pdf' }
      : { folder: 'lemir-cars', resource_type: 'image' as const }

    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err || !result) return reject(err)
      resolve(result.secure_url)
    })
    stream.end(buffer)
  })

  return NextResponse.json({ url })
}

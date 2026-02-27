'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Upload, X } from 'lucide-react'

interface VehicleFormProps {
  initialData?: {
    id?: string
    type?: string
    status?: string
    make?: string
    model?: string
    trim?: string
    year?: number
    mileage?: number | null
    fuel?: string | null
    gearbox?: string | null
    bodyType?: string | null
    drive?: string | null
    powerHP?: number | null
    engineCC?: number | null
    color?: string | null
    priceGross?: number
    currency?: string
    installmentAmount?: number | null
    installmentTermMonths?: number | null
    installmentDownPayment?: number | null
    location?: string | null
    descriptionPL?: string | null
    descriptionEN?: string | null
    images?: string[]
    videos?: string[]
    features?: string[]
    promoted?: boolean
    contactPhone?: string | null
    contactName?: string | null
  }
  userPhone?: string | null
  userEmail?: string | null
  userName?: string | null
}

const FUEL_OPTIONS = ['Benzyna', 'Diesel', 'Hybryda', 'Hybryda plug-in', 'Elektryczny', 'LPG', 'CVT']
const GEARBOX_OPTIONS = ['Manualna', 'Automatyczna', 'CVT', 'DCT']
const BODY_OPTIONS = ['Sedan', 'Hatchback', 'Kombi', 'SUV', 'Coupe', 'Cabrio', 'Van', 'Pickup', 'Crossover']
const DRIVE_OPTIONS = ['FWD', 'RWD', '4x4', 'AWD']

export function VehicleForm({ initialData, userPhone, userEmail, userName }: VehicleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const uploadPdf = async (file: File) => {
    setUploadingPdf(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Błąd uploadu PDF')
      const { url } = await res.json()
      setSpecPdfUrl(url)
    } catch (err) {
      alert('Błąd uploadu PDF: ' + (err instanceof Error ? err.message : 'Nieznany'))
    } finally {
      setUploadingPdf(false)
    }
  }

  const isEdit = !!initialData?.id

  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [imageUrls, setImageUrls] = useState<string>(
    initialData?.images?.filter(i => i.startsWith('http')).join('\n') || ''
  )
  const [videos, setVideos] = useState<string>(initialData?.videos?.join('\n') || '')
  const [features, setFeatures] = useState<string>(initialData?.features?.join(', ') || '')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [specPdfUrl, setSpecPdfUrl] = useState<string | null>(initialData?.specificationUrl || null)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true)
    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })
        if (res.ok) {
          const { url } = await res.json()
          uploaded.push(url)
        }
      } catch {
        // ignore individual failures
      }
    }

    setImages(prev => [...prev, ...uploaded])
    setUploadingImages(false)
  }

  const removeImage = (url: string) => {
    setImages(prev => prev.filter(i => i !== url))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)
    const getStr = (k: string) => fd.get(k) as string || undefined
    const getNum = (k: string) => {
      const v = fd.get(k) as string
      return v ? parseFloat(v) : undefined
    }

    // Combine uploaded images + manual URLs
    const urlImages = imageUrls.split('\n').map(s => s.trim()).filter(Boolean)
    const allImages = [...images.filter(i => !i.startsWith('http') || urlImages.includes(i)), ...urlImages]
    const uniqueImages = Array.from(new Set([...images, ...urlImages]))

    const data = {
      type: getStr('type'),
      status: getStr('status'),
      make: getStr('make'),
      model: getStr('model'),
      trim: getStr('trim'),
      year: getNum('year'),
      mileage: getNum('mileage') || null,
      fuel: getStr('fuel') || null,
      gearbox: getStr('gearbox') || null,
      bodyType: getStr('bodyType') || null,
      drive: getStr('drive') || null,
      powerHP: getNum('powerHP') || null,
      engineCC: getNum('engineCC') || null,
      color: getStr('color') || null,
      priceGross: getNum('priceGross'),
      currency: getStr('currency') || 'PLN',
      installmentAmount: getNum('installmentAmount') || null,
      installmentTermMonths: getNum('installmentTermMonths') || null,
      installmentDownPayment: getNum('installmentDownPayment') || null,
      location: getStr('location') || null,
      descriptionPL: (fd.get('descriptionPL') as string) || null,
      descriptionEN: (fd.get('descriptionEN') as string) || null,
      images: uniqueImages,
      videos: videos.split('\n').map(s => s.trim()).filter(Boolean),
      features: features.split(',').map(s => s.trim()).filter(Boolean),
      promoted: fd.get('promoted') === 'on',
      contactPhone: getStr('contactPhone') || null,
      contactName: getStr('contactName') || null,
    }

    try {
      const url = isEdit ? `/api/admin/vehicles/${initialData.id}` : '/api/admin/vehicles'
      const res = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error || 'Błąd serwera')
      }

      router.push('/admin/pojazdy')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd. Spróbuj ponownie.')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
  const sel = inp + ' bg-white'
  const lbl = 'block text-xs font-medium text-gray-500 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Basic */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Podstawowe</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Typ *</label>
            <select name="type" className={sel} defaultValue={initialData?.type || 'USED'} required>
              <option value="USED">Używany</option>
              <option value="NEW">Nowy</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Status *</label>
            <select name="status" className={sel} defaultValue={initialData?.status || 'ACTIVE'} required>
              <option value="ACTIVE">Aktywny</option>
              <option value="INACTIVE">Nieaktywny</option>
              <option value="RESERVED">Zarezerwowany</option>
              <option value="SOLD">Sprzedany</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Waluta</label>
            <select name="currency" className={sel} defaultValue={initialData?.currency || 'PLN'}>
              <option value="PLN">PLN</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Marka *</label>
            <input type="text" name="make" className={inp} required defaultValue={initialData?.make} maxLength={100} />
          </div>
          <div>
            <label className={lbl}>Model *</label>
            <input type="text" name="model" className={inp} required defaultValue={initialData?.model} maxLength={100} />
          </div>
          <div>
            <label className={lbl}>Wersja / trim</label>
            <input type="text" name="trim" className={inp} defaultValue={initialData?.trim || ''} maxLength={200} />
          </div>
          <div>
            <label className={lbl}>Rocznik *</label>
            <input type="number" name="year" className={inp} required defaultValue={initialData?.year || new Date().getFullYear()} min={1900} max={2030} />
          </div>
          <div>
            <label className={lbl}>Przebieg (km)</label>
            <input type="number" name="mileage" className={inp} defaultValue={initialData?.mileage ?? ''} min={0} />
          </div>
          <div>
            <label className={lbl}>Lokalizacja</label>
            <input type="text" name="location" className={inp} defaultValue={initialData?.location || ''} maxLength={100} />
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Dane techniczne</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className={lbl}>Paliwo</label>
            <select name="fuel" className={sel} defaultValue={initialData?.fuel || ''}>
              <option value="">—</option>
              {FUEL_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Skrzynia</label>
            <select name="gearbox" className={sel} defaultValue={initialData?.gearbox || ''}>
              <option value="">—</option>
              {GEARBOX_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Nadwozie</label>
            <select name="bodyType" className={sel} defaultValue={initialData?.bodyType || ''}>
              <option value="">—</option>
              {BODY_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Napęd</label>
            <select name="drive" className={sel} defaultValue={initialData?.drive || ''}>
              <option value="">—</option>
              {DRIVE_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Moc (KM)</label>
            <input type="number" name="powerHP" className={inp} defaultValue={initialData?.powerHP ?? ''} min={1} max={2000} />
          </div>
          <div>
            <label className={lbl}>Pojemność (cm³)</label>
            <input type="number" name="engineCC" className={inp} defaultValue={initialData?.engineCC ?? ''} />
          </div>
          <div>
            <label className={lbl}>Kolor</label>
            <input type="text" name="color" className={inp} defaultValue={initialData?.color || ''} maxLength={50} />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Cena i finansowanie</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className={lbl}>Cena brutto *</label>
            <input type="number" name="priceGross" className={inp} required defaultValue={initialData?.priceGross} min={0} step={1} />
          </div>
          <div>
            <label className={lbl}>Rata miesięczna (zł)</label>
            <input type="number" name="installmentAmount" className={inp} defaultValue={initialData?.installmentAmount ?? ''} min={0} step={1} />
          </div>
          <div>
            <label className={lbl}>Okres (mies.)</label>
            <input type="number" name="installmentTermMonths" className={inp} defaultValue={initialData?.installmentTermMonths ?? ''} min={1} max={120} />
          </div>
          <div>
            <label className={lbl}>Wpłata własna (zł)</label>
            <input type="number" name="installmentDownPayment" className={inp} defaultValue={initialData?.installmentDownPayment ?? ''} min={0} step={1} />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Kontakt do ogłoszenia</h2>
        <p className="text-xs text-gray-400">Domyślnie pobierany z Twojego profilu. Możesz zmienić dla tego ogłoszenia.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Imię / nazwa handlowca</label>
            <input
              type="text"
              name="contactName"
              className={inp}
              defaultValue={initialData?.contactName || userName || ''}
              maxLength={100}
            />
          </div>
          <div>
            <label className={lbl}>Telefon kontaktowy</label>
            <input
              type="tel"
              name="contactPhone"
              className={inp}
              defaultValue={initialData?.contactPhone || userPhone || ''}
              placeholder="+48 32 508 80 00"
              maxLength={20}
            />
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Opis</h2>
        <div>
          <label className={lbl}>Opis PL</label>
          <textarea name="descriptionPL" className={inp} rows={5} defaultValue={initialData?.descriptionPL || ''} maxLength={10000} />
        </div>
        <div>
          <label className={lbl}>Opis EN (opcjonalny — włącza filtr &quot;Tylko EN&quot;)</label>
          <textarea name="descriptionEN" className={inp} rows={5} defaultValue={initialData?.descriptionEN || ''} maxLength={10000} />
        </div>
      </div>

      {/* Media */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Zdjęcia</h2>

        {/* Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImages}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors w-full justify-center"
          >
            {uploadingImages ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Wgrywanie...</>
            ) : (
              <><Upload className="w-4 h-4" /> Kliknij aby wgrać zdjęcia</>
            )}
          </button>
        </div>

        {/* Preview uploaded */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-full h-20 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Manual URLs */}
        <div>
          <label className={lbl}>Lub wklej URL zdjęć (jeden na linię)</label>
          <textarea
            className={inp}
            rows={3}
            value={imageUrls}
            onChange={(e) => setImageUrls(e.target.value)}
            placeholder="https://example.com/photo1.jpg"
          />
        </div>

        {/* Videos */}
        <div>
          <label className={lbl}>Wideo — URL YouTube/Vimeo/MP4, jeden na linię</label>
          <textarea
            className={inp}
            rows={2}
            value={videos}
            onChange={(e) => setVideos(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        {/* Features */}
        <div>
          <label className={lbl}>Wyposażenie (rozdzielone przecinkami)</label>
          <input
            type="text"
            className={inp}
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder="Nawigacja, Skóra, Panorama, HUD"
          />
        </div>
      </div>

      {/* Promoted */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="promoted" defaultChecked={initialData?.promoted} className="w-4 h-4 rounded text-primary-600" />
          <div>
            <div className="font-medium text-gray-900">Wyróżnione ogłoszenie</div>
            <div className="text-sm text-gray-400">Pojawi się na górze listingu z oznaczeniem ⭐</div>
          </div>
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isEdit ? 'Zapisz zmiany' : 'Dodaj ogłoszenie'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Anuluj
        </button>
      </div>
    </form>
  )
}

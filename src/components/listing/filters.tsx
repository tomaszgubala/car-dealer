'use client'

import { useState, useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToggleSwitch } from '@/components/ui/toggle'

interface FilterOptions {
  makes: string[]
  makeModels: Record<string, string[]>
  fuels: string[]
  gearboxes: string[]
  bodyTypes: string[]
  drives: string[]
  locations: string[]
}

interface ListingFiltersProps {
  options: FilterOptions
  showInstallment: boolean
  onInstallmentChange: (val: boolean) => void
  onlyEN: boolean
  onOnlyENChange: (val: boolean) => void
  totalCount: number
}

function RangeInput({
  labelFrom,
  labelTo,
  nameFrom,
  nameTo,
  defaultFrom,
  defaultTo,
  step = 1,
}: {
  labelFrom: string
  labelTo: string
  nameFrom: string
  nameTo: string
  defaultFrom?: string
  defaultTo?: string
  step?: number
}) {
  return (
    <div className="flex gap-2">
      <input
        type="number"
        name={nameFrom}
        placeholder={labelFrom}
        defaultValue={defaultFrom}
        step={step}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
      <input
        type="number"
        name={nameTo}
        placeholder={labelTo}
        defaultValue={defaultTo}
        step={step}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
      />
    </div>
  )
}

function MultiSelect({
  name,
  options,
  value,
  placeholder,
}: {
  name: string
  options: string[]
  value: string[]
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string[]>(value)

  const toggle = (opt: string) => {
    setSelected((prev) => prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt])
  }

  return (
    <div className="relative">
      {selected.map((s) => (
        <input key={s} type="hidden" name={name} value={s} />
      ))}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-left"
      >
        <span className={cn(selected.length === 0 ? 'text-gray-400' : 'text-gray-900')}>
          {selected.length === 0 ? placeholder : selected.join(', ')}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="rounded text-primary-600"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export function ListingFilters({
  options,
  showInstallment,
  onInstallmentChange,
  onlyEN,
  onOnlyENChange,
  totalCount,
}: ListingFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedMake, setSelectedMake] = useState<string[]>(
    searchParams.getAll('make')
  )

  const currentSort = searchParams.get('sort') || 'newest'

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const data = new FormData(e.currentTarget)
      const params = new URLSearchParams()

      // Carry type from pathname or existing param
      const type = searchParams.get('type')
      if (type) params.set('type', type)

      for (const [key, val] of data.entries()) {
        if (val && String(val).trim()) params.append(key, String(val))
      }
      params.set('page', '1')

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router, searchParams]
  )

  const hasActiveFilters = [...searchParams.entries()].some(
    ([k]) => !['type', 'page', 'sort'].includes(k)
  )

  const clearFilters = () => {
    const params = new URLSearchParams()
    const type = searchParams.get('type')
    if (type) params.set('type', type)
    const sort = searchParams.get('sort')
    if (sort) params.set('sort', sort)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-3">
      {/* Top bar: search + controls */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Quick search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="q"
              placeholder="Marka, model, VIN, słowo kluczowe..."
              defaultValue={searchParams.get('q') || ''}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors',
              showFilters || hasActiveFilters
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtry
            {hasActiveFilters && (
              <span className="ml-1 bg-primary-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                !
              </span>
            )}
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50"
            disabled={isPending}
          >
            Szukaj
          </button>
        </div>

        {/* Sort + toggles */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-4">
            <ToggleSwitch
              checked={showInstallment}
              onChange={onInstallmentChange}
              labelLeft="Cena"
              labelRight="Rata"
              aria-label="Przełącz widok ceny / raty"
              size="sm"
            />
            <ToggleSwitch
              checked={onlyEN}
              onChange={onOnlyENChange}
              label="Tylko EN"
              aria-label="Pokaż tylko ogłoszenia po angielsku"
              size="sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">{totalCount} aut</span>
            <select
              name="sort"
              defaultValue={currentSort}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString())
                params.set('sort', e.target.value)
                params.set('page', '1')
                router.push(`${pathname}?${params.toString()}`)
              }}
              className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              <option value="newest">Najnowsze</option>
              <option value="cheapest">Najtańsze</option>
              <option value="expensive">Najdroższe</option>
              <option value="low_mileage">Najmniejszy przebieg</option>
              <option value="year_desc">Rocznik malejąco</option>
              <option value="promoted">Wyróżnione</option>
            </select>
          </div>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Marka
              </label>
              <MultiSelect
                name="make"
                options={options.makes}
                value={searchParams.getAll('make')}
                placeholder="Wszystkie"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Paliwo
              </label>
              <MultiSelect
                name="fuel"
                options={options.fuels}
                value={searchParams.getAll('fuel')}
                placeholder="Wszystkie"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Skrzynia
              </label>
              <MultiSelect
                name="gearbox"
                options={options.gearboxes}
                value={searchParams.getAll('gearbox')}
                placeholder="Wszystkie"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Nadwozie
              </label>
              <MultiSelect
                name="bodyType"
                options={options.bodyTypes}
                value={searchParams.getAll('bodyType')}
                placeholder="Wszystkie"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Lokalizacja
              </label>
              <MultiSelect
                name="location"
                options={options.locations}
                value={searchParams.getAll('location')}
                placeholder="Wszystkie"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Rocznik
              </label>
              <RangeInput
                nameFrom="yearFrom"
                nameTo="yearTo"
                labelFrom="od"
                labelTo="do"
                defaultFrom={searchParams.get('yearFrom') || ''}
                defaultTo={searchParams.get('yearTo') || ''}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Cena (PLN)
              </label>
              <RangeInput
                nameFrom="priceFrom"
                nameTo="priceTo"
                labelFrom="od"
                labelTo="do"
                defaultFrom={searchParams.get('priceFrom') || ''}
                defaultTo={searchParams.get('priceTo') || ''}
                step={1000}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
                Przebieg (km)
              </label>
              <RangeInput
                nameFrom="mileageFrom"
                nameTo="mileageTo"
                labelFrom="od"
                labelTo="do"
                defaultFrom={searchParams.get('mileageFrom') || ''}
                defaultTo={searchParams.get('mileageTo') || ''}
                step={5000}
              />
            </div>

            <div className="col-span-full flex gap-2 pt-1">
              <button
                type="submit"
                className="px-5 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Zastosuj filtry
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  Wyczyść
                </button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

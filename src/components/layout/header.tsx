import Link from 'next/link'
import { Phone } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-gray-900 text-lg tracking-tight">
          L&apos;EMIR
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/?type=USED" className="hover:text-blue-600 transition-colors">Samochody używane</Link>
          <Link href="/?type=NEW" className="hover:text-blue-600 transition-colors">Samochody nowe</Link>
          <Link href="/kontakt" className="hover:text-blue-600 transition-colors">Kontakt</Link>
        </nav>

        <a
          href="tel:+48325088000"
          className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">+48 32 508 80 00</span>
        </a>
      </div>
    </header>
  )
}

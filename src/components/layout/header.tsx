import Link from 'next/link'
import { Car, Phone } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 text-lg">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          AutoDealer
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/?type=USED" className="hover:text-gray-900 transition-colors">Używane</Link>
          <Link href="/?type=NEW" className="hover:text-gray-900 transition-colors">Nowe</Link>
          <Link href="/kontakt" className="hover:text-gray-900 transition-colors">Kontakt</Link>
        </nav>

        <a
          href="tel:+48123456789"
          className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors"
        >
          <Phone className="w-4 h-4" />
          <span className="hidden sm:inline">+48 123 456 789</span>
        </a>
      </div>
    </header>
  )
}

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white border-t border-blue-100 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="font-bold text-gray-900 mb-1">L&apos;EMIR Sp. z o.o.</div>
            <p className="text-sm text-gray-400">ul. Jana III Sobieskiego 16, 41-300 Dąbrowa Górnicza</p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">Oferta</Link>
            <Link href="/kontakt" className="hover:text-blue-600 transition-colors">Kontakt</Link>
            <Link href="/polityka-prywatnosci" className="hover:text-blue-600 transition-colors">Prywatność</Link>
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50 text-xs text-gray-400 flex flex-wrap gap-4 justify-between">
          <span>© {new Date().getFullYear()} Tomasz Gubała. Wszelkie prawa zastrzeżone.</span>
          <span>Dane prezentowane na stronie mają charakter informacyjny.</span>
        </div>
      </div>
    </footer>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin', 'latin-ext'], display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'L'EMIR — Samochody nowe i używane',
    template: '%s | L'EMIR',
  },
  description: 'Szeroki wybór samochodów nowych i używanych. Sprawdź naszą ofertę.',
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    siteName: 'L'EMIR',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={inter.className}>
      <body className="min-h-screen flex flex-col bg-surface-50">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Car, BarChart2, Download, Users, LogOut, Car as CarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/pojazdy', label: 'Pojazdy', icon: Car },
  { href: '/admin/statystyki', label: 'Statystyki', icon: BarChart2 },
  { href: '/admin/import', label: 'Import', icon: Download },
  { href: '/admin/uzytkownicy', label: 'Użytkownicy', icon: Users, adminOnly: true },
]

interface SidebarProps {
  user: { name?: string | null; email: string; role: string }
}

export function AdminSidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-50">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-gray-900">
          <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
            <CarIcon className="w-4 h-4 text-white" />
          </div>
          Admin
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          if (item.adminOnly && user.role !== 'ADMIN') return null
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-gray-50">
        <div className="px-3 py-2 mb-1">
          <div className="text-xs font-medium text-gray-900 truncate">{user.name || user.email}</div>
          <div className="text-xs text-gray-400">{user.role}</div>
        </div>
        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50">
          <CarIcon className="w-4 h-4" />
          Zobacz stronę
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Wyloguj
        </button>
      </div>
    </div>
  )
}

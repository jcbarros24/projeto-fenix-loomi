'use client'

import {
  Cpu,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquare,
  User,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/atoms/Button/button'
import { cn } from '@/lib/utils'

import { SidebarItem } from './types'

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Tickets', href: '/tickets', icon: FileText },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
  { label: 'Profile', href: '/profile', icon: User },
  { label: 'Simulator', href: '/simulator', icon: Cpu },
]

const isRouteActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)

const SidebarNav = ({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) => (
  <nav className="space-y-1 px-3">
    {sidebarItems.map((item) => {
      const Icon = item.icon
      const active = isRouteActive(pathname, item.href)

      return (
        <Link
          key={item.label}
          href={item.href}
          onClick={onNavigate}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            active
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100',
          )}
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </Link>
      )
    })}
  </nav>
)

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      <div className="fixed top-0 z-40 flex h-14 w-full items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-xs font-semibold text-white">
            NL
          </div>
          <span className="text-sm font-semibold text-gray-900">Loomi</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-sm font-semibold text-white">
            NL
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Loomi</p>
            <p className="text-xs text-gray-500">Painel principal</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav pathname={pathname} />
        </div>
        <div className="px-6 pb-6 text-xs text-gray-400">v0.1</div>
      </aside>

      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden',
          isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        <div
          className={cn(
            'absolute inset-0 bg-black/40 transition-opacity',
            isMobileOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setIsMobileOpen(false)}
        />
        <aside
          className={cn(
            'absolute left-0 top-0 h-full w-64 bg-white shadow-xl transition-transform',
            isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-xs font-semibold text-white">
                NL
              </div>
              <span className="text-sm font-semibold text-gray-900">Loomi</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Fechar menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <SidebarNav
              pathname={pathname}
              onNavigate={() => setIsMobileOpen(false)}
            />
          </div>
        </aside>
      </div>
    </>
  )
}
